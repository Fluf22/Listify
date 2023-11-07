const handler = async (event, context) => {
    const reqBody = JSON.parse(event.body);
    console.log("Req body: ", reqBody);
    if (reqBody.event === "validate") {
        const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(',');
        if (authorizedEmails.includes(reqBody.user.email.toLocaleLowerCase().trim()) === false) {
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
        console.log("Not a validate");
        return {
            statusCode: 200
        };
    }
};

module.exports = { handler };
