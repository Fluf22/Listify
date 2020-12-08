const handler = async (event, context) => {
	const reqBody = JSON.parse(event.body);
	console.log("Req body: ", reqBody);
	if (reqBody.event === "signup") {
		return {
			statusCode: 200,
			body: JSON.stringify({
				"app_metadata": Object.assign({}, reqBody.user.app_metadata, { roles: ["user"] })
			})
		}
	} else {
		console.log("Not a signup");
		return {
			statusCode: 200
		};
	}
};

module.exports = { handler };
