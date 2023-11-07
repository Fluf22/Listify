const createUserRoute = require('./users/create');

const handler = async (event, context) => {
	const reqBody = JSON.parse(event.body);
	console.log("Req body: ", reqBody);
	if (reqBody.event === "signup") {
		const authorizedEmails = [];
		try {
			authorizedEmails.push(...JSON.parse(process.env.AUTHORIZED_EMAILS));
		} catch (e) {
			console.error("failed to parse authorized emails: ", e);
		}
		console.log("authorized emails: ", authorizedEmails)
		if (authorizedEmails.includes(reqBody.user.email) === false) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized"
				})
			}
		}

		const userEvent = {
			body: JSON.stringify({
				email: reqBody.user.email,
				name: reqBody.user.user_metadata?.full_name ?? reqBody.user.email
			})
		};
		await createUserRoute.handler(userEvent);
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
