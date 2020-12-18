/* Import faunaDB sdk */
const process = require('process')

const { query, Client } = require('faunadb')

const client = new Client({
	secret: process.env.FAUNADB_SERVER_SECRET,
})

const handler = async (event, userMail, userName) => {
	const redeemData = JSON.parse(event.body)
	const { id } = event
	console.log(`Function 'update' invoked. update id: ${id}`)
	return client
		.query(query.Get(query.Ref(`classes/wishes/${id}`)))
		.then((originalWish) => {
			console.log('success', originalWish)
			if (originalWish.data.created.for === userMail) {
				return {
					statusCode: 401,
					body: "Unauthorized"
				};
			}
			const newWishData = Object.assign({}, originalWish.data, {
				offeredBy: redeemData.type === "REMOVE" || redeemData.percentage === 0 ? (
					originalWish.data.offeredBy !== undefined ? originalWish.data.offeredBy.filter(el => el.name !== userName) : []
				) : (
					originalWish.data.offeredBy !== undefined ? [
						...originalWish.data.offeredBy.filter(el => el.name !== userName),
						{
							name: userName,
							percentage: redeemData.percentage
						}
					] : [
						{
							name: userName,
							percentage: redeemData.percentage
						}
					]
				)
			});
			return client
				.query(query.Update(query.Ref(`classes/wishes/${id}`), { data: newWishData }))
				.then((response) => {
					console.log('success', response)
					return {
						statusCode: 200,
						body: JSON.stringify(response),
					}
				})
				.catch((error) => {
					console.log('error', error)
					return {
						statusCode: 400,
						body: JSON.stringify(error),
					}
				})
		})
		.catch((error) => {
			console.log('error', error)
			return {
				statusCode: 400,
				body: JSON.stringify(error),
			}
		});
}

module.exports = { handler }
