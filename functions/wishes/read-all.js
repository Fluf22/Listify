/* Import faunaDB sdk */
const process = require('process')
const fetch = require('node-fetch');

const { query, Client } = require('faunadb')

const client = new Client({
	secret: process.env.FAUNADB_SERVER_SECRET,
})

const handler = async (event, context, userMail) => {
	console.log("Function `read-all` invoked");
	const { identity } = context.clientContext;
	console.log("identity: ",identity)
	const usersUrl = `${identity.url}/admin/users`;
	const adminAuthHeader = 'Bearer ' + identity.token;

	return fetch(usersUrl, {
		method: 'GET',
		headers: { Authorization: adminAuthHeader },
	}).then((response) => {
		return response.json();
	}).then(({ users }) => {
		const userList = users?.map(user => ({ email: user.email, name: user.user_metadata?.full_name || "Inconnu" })) || [];
		console.log('userList: ', userList);
		return client
			.query(query.Paginate(query.Match(query.Ref('indexes/all_wishes'))))
			.then((response) => {
				const itemRefs = response.data
				// create new query out of item refs. http://bit.ly/2LG3MLg
				const getAllItemsDataQuery = itemRefs.map((ref) => {
					return query.Get(ref)
				})
				// then query the refs
				return client.query(getAllItemsDataQuery).then((ret) => {
					return {
						statusCode: 200,
						body: JSON.stringify({
							wishes: ret.map(item => ({ ...item.data, id: item.ref.id })).filter(item => item.created.by === userMail && item.created.for === userMail),
							userList
						}),
					}
				})
			}).catch((error) => {
				console.log('error', error)
				return {
					statusCode: 400,
					body: JSON.stringify(error),
				}
			});
	}).catch((e) => {
		return {
			statusCode: 500,
			body: 'Internal Server Error: ' + e,
		};
	});
}

module.exports = { handler }
