const createUserRoute = require('./users/create');

const handler = async (event, context) => {
	const reqBody = JSON.parse(event.body);
	console.log("Req body: ", reqBody);
	if (reqBody.event === "signup") {
		const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(',');
		if (authorizedEmails.includes(reqBody.user.email.toLocaleLowerCase().trim()) === false) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message: "Unauthorized"
				})
			}
		}

		const userEvent = {
			body: JSON.stringify({
				email: reqBody.user.email.toLocaleLowerCase().trim(),
				name: reqBody.user.user_metadata?.full_name.trim() ?? reqBody.user.email.toLocaleLowerCase().trim()
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
