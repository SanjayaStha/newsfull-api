import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import { io } from './socket';
import { Server as HttpServer } from 'http';
import mongoose from 'mongoose';
import errorHandler from './middlewares/errorHandler';
import { NotFoundException } from './exceptions/httpException';

export class Server {
	constructor(config, routes) {
		this.port = config.port;
		this.host = config.host;
		this.app = config.app;
		this.httpServer = new HttpServer(this.app);
		this.initRoutes(routes);
		this.initSocket();
	}

	initRoutes(routes) {
		this.app.use(json());
		this.app.use(urlencoded({ extended: true }));

		this.app.get('/health', function (req, res) {
			res.status(200).send('OK');
		});

		this.app.use(cors({
			origin: '*',
			methods: ['POST', 'GET', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
		}));

		this.app.use('/', routes);

		this.app.use((req, res, next) => next(new NotFoundException(`404 Not found: ${req.url} not exist`)));
		this.app.use(errorHandler);
	}

	initSocket() {
		io.attach(this.httpServer);
	}

	start(cb) {
		mongoose.connect('mongodb://localhost:27017/shopping_app', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		}).then(() => {
			console.log('mongodb inited');
			this.httpServer.listen(parseInt(this.port), this.host, () => {
				cb(null);
			});
		}).catch(e => {
			cb(e);
		});
	}
}