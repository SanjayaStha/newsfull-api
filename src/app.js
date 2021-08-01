require('dotenv').config();

const express = require('express');
const { Server } = require('./server');
const routes = require('./routes');
const { HOST, PORT } = require('./config/env');

const host = HOST || '0.0.0.0';
const port = PORT || 5000;
const server = new Server({
	host,
	port,
	app: express()
}, routes);

server.start((e) => {
	if (e) return console.log(e);
	console.log(`20 Trusted server running at http://${host}:${port}`);
});