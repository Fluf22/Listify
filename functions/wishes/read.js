/* Import faunaDB sdk */
const process = require('process')

const { query, Client } = require('faunadb')

const client = new Client({
	secret: process.env.FAUNADB_SERVER_SECRET,
})

const handler = async (event, userMail) => {
	const { id: wishesUserMail } = event;
	console.log(`Function 'read' invoked. Read id: ${wishesUserMail}`)

	return client
		.query(query.Paginate(query.Match(query.Ref('indexes/all_wishes')), { size: 1000 }))
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
					body: JSON.stringify(ret.map(item => Object.assign({}, item.data, {
						id: item.ref.id,
						offeredBy: ((item.data.created.by === userMail && item.data.created.for === userMail) || (item.data.offeredBy === undefined)) ? [] : item.data.offeredBy
					})).filter(item => wishesUserMail === userMail ? item.created.by === userMail && item.created.for === userMail : item.created.for === wishesUserMail)),
				}
			})
		}).catch((error) => {
			console.log('error', error)
			return {
				statusCode: 400,
				body: JSON.stringify(error),
			}
		});
}

module.exports = { handler }
