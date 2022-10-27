import http from 'http';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';

// Set Port(3000)
const APP_PORT = process.env.APP_PORT || 3000;
const app = http.createServer(requestHandler);

app.listen(APP_PORT);
console.log(`🖥  HTTP Server running : ${APP_PORT}`);

// Handle all request to the server
function requestHandler(request, response) {
	console.log(`🖥  Received request for ${request.url}`);

	let filePath = './client' + request.url;
	if (filePath == './client/') {
		// Serve index.html on request
		filePath = './client/index.html';
	}

	// Filename
	const extname = String(path.extname(filePath)).toLowerCase();
	console.log(`🖥  Serving ${filePath}`);

	const mimeTypes = {
		'.html': 'text/html',
		'.js' : 'text/javascript',
		'.css' : 'text/css',
		'.png' : 'image/png',
		'.jpg' : 'image/jpg',
		'.gif' : 'image/gif',
		'.svg' : 'image/svg+xml'
	}

	const contentType = mimeTypes[extname] || 'application/octet-stream';
	fs.readFile(filePath, function (error, content) {
		if (error) {
			// 404
			if (error.cond == 'ENOENT') {
				fs.readFile('./client/404.html', function(error, content) {
					// Set header
					response.writeHead(404, { 'Content-type': contentType });
					response.end(content, 'utf-8');
				})
			} else {
				response.writeHead(500);
				response.end('Sorry, there was an error: ' + error.code + '..\n');
			}
		} else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	})
}

// SOCKET.IO
const io = new Server(app, {
	path: '/socket.io',
});	

// attach socket.io to our web server
io.attach(app, {
	// includes local domain to avoid CORS error locally
	// configure it accordingly for production
	cors: {
		origin: 'http://localhost',
		methods: ['GET', 'POST'],
		credentials: true,
		transports: ['websocket', 'polling']
	},
	allowEI03: true
});

io.on('connection', (socket) => {
	console.log('🔗  New Socket connected! >>', socket.id);
})
