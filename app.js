var path = require('path');
var express = require('express');
var http = require('http');
var io = require('socket.io');
var port = process.env.PORT || 5000;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
server.listen(port, function(){
	console.log('Listening at: %d', port);
});

app.get('/', function(request, response){
	response.sendfile(__dirname + '/index.html');
});


io.listen(server).on('connection', function(client){
	console.log('Client conected...');
	messages.forEach(function(message){
		client.emit('message', {username: message.user, message: message.data})
	});	

	client.on('message', function(data){
		console.log('Message Received: ', data);
		storeMessages(client.username, data);
		client.broadcast.emit('message', {
			username: client.username,
			message: data
		});
	});

	client.on('join', function(nickname){
		console.log(nickname + ' joined');
		client.username = nickname;
		client.broadcast.emit('add chatter', nickname);
	});

	client.on('disconnect', function() {
			console.log(client.username + ' disconnect');
      client.broadcast.emit('remove chatter', client.username);
  });
});


var messages = [];
var users = {};

var storeMessages = function(user, data){
	messages.push({user: user, data: data });
	trimArray(messages,10);
};

var trimArray = function(array, count){
	if (array.length > count){
		array.shift();
	}
};