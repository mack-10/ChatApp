console.log('chat.js file loaded!');

// By default, socket.io() connects to the host that served the page
// So we don't have to pass the server url
const socket = io.connect();

// Prompt to ask user's name
const username = prompt("Welcome! Please enter your name: ");
console.log(`username: ${username}`);

// Emit event to server with the user's name
// socket.emit([eventname], [data we're sending])
socket.emit("new-connection", { username });

// Captures welcome-message event from the server
socket.on("welcome-message", (data) => {
	console.log("received welcome-message >>", data);
});
