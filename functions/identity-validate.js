const createUserRoute = require('./users/create');

const handler = async (event, context) => {
    const reqBody = JSON.parse(event.body);
    console.log("Req body: ", reqBody);
    if (reqBody.event === "validate") {
        const authorizedEmails = [];
        try {
            authorizedEmails.push(...JSON.parse(process.env.AUTHORIZED_EMAILS));
        } catch (e) {
            console.error("failed to parse authorized emails: ", e);
        }
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
        console.log("Not a signup");
        return {
            statusCode: 200
        };
    }
};

module.exports = { handler };
