
import { Server } from 'socket.io';

export const io = new Server({ cors: {} });

io.use((socket, next) => {
	// check authorization
	next();
});

io.on('connection', function (socket) {
	console.log('New socket user connected!');
	setInterval(() => {
		socket.emit('HELLO_MESSAGE', {
			data: 'hell'
		});
	}, 2000);
});