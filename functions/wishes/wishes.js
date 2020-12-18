const createRoute = require('./create')
const deleteRoute = require('./delete')
const readRoute = require('./read')
const readAllRoute = require('./read-all')
const updateRoute = require('./update')
const patchRoute = require('./patch')

const handler = async (event, context) => {
	const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
	const segments = path.split('/').filter(Boolean);

	// console.log("User: ", context.clientContext)
	const { user } = context.clientContext;
	if (user === undefined || user.email === undefined || user.app_metadata === undefined || user.app_metadata.roles === undefined || !user.app_metadata.roles.includes("user")) {
		return {
			statusCode: 401,
			body: "Unauthorized"
		};
	}
	const userMail = user.email;
	const userName = user.user_metadata.full_name;

	switch (event.httpMethod) {
		case 'GET':
			// e.g. GET /.netlify/functions/wishes
			if (segments.length === 0) {
				return readAllRoute.handler(event, context, userMail)
			}
			// e.g. GET /.netlify/functions/wishes/123456
			if (segments.length === 1) {
				const [id] = segments
				event.id = id
				return readRoute.handler(event, userMail)
			}
			return {
				statusCode: 500,
				body:
					'too many segments in GET request, must be either /.netlify/functions/wishes or /.netlify/functions/wishes/123456',
			}

		case 'POST':
			// e.g. POST /.netlify/functions/wishes with a body of key value pair objects, NOT strings
			return createRoute.handler(event, context, userMail)
		case 'PUT':
			// e.g. PUT /.netlify/functions/wishes/123456 with a body of key value pair objects, NOT strings
			if (segments.length === 1) {
				const [id] = segments
				event.id = id
				return updateRoute.handler(event, userMail)
			}
			return {
				statusCode: 500,
				body: 'invalid segments in POST request, must be /.netlify/functions/wishes/123456',
			}
		case "PATCH":
			// e.g. PATCH /.netlify/functions/wishes/123456 with a body of key value pair objects, NOT strings
			if (segments.length === 1) {
				const [id] = segments
				event.id = id
				return patchRoute.handler(event, userMail, userName);
			}
			return {
				statusCode: 500,
				body: 'invalid segments in PATCH request, must be /.netlify/functions/wishes/123456',
			}
		case 'DELETE':
			// e.g. DELETE /.netlify/functions/wishes/123456
			if (segments.length === 1) {
				const [id] = segments
				event.id = id
				return deleteRoute.handler(event, userMail)
			}
			return {
				statusCode: 500,
				body: 'invalid segments in DELETE request, must be /.netlify/functions/wishes/123456',
			}
		default:
			return {
				statusCode: 500,
				body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/PATCH/DELETE',
			}
	}
}

module.exports = { handler }
