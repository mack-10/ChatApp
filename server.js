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

	// MIME setting
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
		if (error) { // 404 Not Found			
			if (error.cond == 'ENOENT') {
				fs.readFile('./client/404.html', function(error, content) {
					// Set header
					response.writeHead(404, { 'Content-type': contentType });
					response.end(content, 'utf-8');
				})
			} else { // 500 Internal Server Error
				response.writeHead(500);
				response.end('Sorry, there was an error: ' + error.code + '..\n');
			}
		} else { // 200 Request success
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	})
}

// SOCKET.IO
// constructor(srv?: http.Server | HTTPSServer | Http2SecureServer | number, opts?: Partial<ServerOptions>);
const io = new Server(app, {
	path: '/socket.io',
});	

// Attach socket.io to our web server
io.attach(app, {
	cors: {
		origin: 'http://localhost',
		methods: ['GET', 'POST'],
		credentials: true,
		// Socket.io's default transports['websocket', 'polling']
		// So, don't need to write -> transports: ['websocket', 'polling'],
	},
	allowEI03: true
});

const users = {};

io.on('connection', (socket) => {
	console.log('🔗  New Socket connected! >>', socket.id);

	// Handles new connection
	// Receive new-connection event from the chat.js(Client)
	socket.on("new-connection", (data) => {
		// Captures event when new clients join
		console.log(`new-connection event received`, data);
		// Add user to list
		users[socket.id] = data.username;
		console.log("users >>", users);
		// Emit welcome message event
		socket.emit("welcome-message", {
			user: "server",
			message: `Welcome to this Socket.io chat ${data.username}. There are ${Object.keys(users).length} users connected`,
		});
	});
});
