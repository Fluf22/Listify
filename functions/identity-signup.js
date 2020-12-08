const handler = async (event, context) => {
	if (event.body.event === "signup") {
		return {
			statusCode: 200,
			body: JSON.stringify({
				"app_metadata": Object.assign({}, event.body.user.app_metadata, { roles: ["user"] })
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
