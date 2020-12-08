#!/usr/bin/env node
const process = require('process')

/* bootstrap database in your FaunaDB account - use with `netlify dev:exec <path-to-this-file>` */
const { query, Client } = require('faunadb')

const createFaunaDB = () => new Promise((resolve, reject) => {
	if (!process.env.FAUNADB_SERVER_SECRET) {
		console.log('No FAUNADB_SERVER_SECRET in environment, skipping DB setup')
		reject("Add a FAUNADB_SERVER_SECRET");
		return;
	}
	console.log('Create the database!')
	const client = new Client({
		secret: process.env.FAUNADB_SERVER_SECRET,
	})

	/* Based on your requirements, change the schema here */
	return client
		.query(query.Create(query.Ref("classes"), { name: "wishes" }))
		.then(() => {
			console.log("Created wishes class");
			return client.query(
				query.Create(query.Ref("indexes"), {
					name: "all_wishes",
					source: query.Ref("classes/wishes"),
					active: true
				}),
			);
		}).then(() => {
			console.log("Created wishes index");
			return client.query(query.Create(query.Ref("classes"), { name: "messages" }));
		}).then(() => {
			console.log("Created messages class");
			return client.query(
				query.Create(query.Ref("indexes"), {
					name: "all_messages",
					source: query.Ref("classes/messages"),
					active: true
				}),
			);
		}).then(() => {
			console.log("Created messages index");
			resolve();
		}).catch((error) => {
			if (error.requestResult.statusCode === 400 && error.message === 'instance not unique') {
				console.log("DB already exists");
			}
			reject(error);
		});
});

createFaunaDB().then(() => console.log("Success!")).catch(err => console.error("Failed: ", err));
