const createUserRoute = require('./users/create');

const handler = async (event, context) => {
    const reqBody = JSON.parse(event.body);
    console.log("Req body: ", reqBody);
    if (reqBody.event === "login") {
        const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(',');
        console.log("authorized emails: ", authorizedEmails)
        if (authorizedEmails.includes(reqBody.user.email) === false) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Unauthorized"
                })
            }
        }

        return {
            statusCode: 200
        }
    } else {
        console.log("Not a login");
        return {
            statusCode: 200
        };
    }
};

module.exports = { handler };
