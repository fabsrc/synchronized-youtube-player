var express = require('express');

var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser('secret'));
app.use(express.bodyParser());
app.set("view engine", "ejs");
app.set("view options", { layout: false });
server.listen(process.env.PORT);

// routing
app.get('/', function (req, res) {
    var id = generateId();
    var jstreams = JSON.stringify(Streams.getAllStreams());
    res.render("index.ejs", {id: id, streams: jstreams});
});

app.get('/:id', function(req, res) {
    var stream = Streams.streams[req.params.id];
    if(!stream){
        res.redirect("/");
    }
    else {
        if(req.cookies['streamid'] == req.params.id) {
            res.render("stream-admin.ejs", {id: req.params.id, title: stream.title, description: stream.description});
        }
        else {
            res.render("stream.ejs", {id: req.params.id, title: stream.title, description: stream.description});
        }
    }
});

// Stream Object
var Stream = function(id, title, description) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.url = "/"+this.id;
    this.password = null;
    this.playlist = [];
    this.privat = false;
    this.currentVideo = null;
    this.users = null;
    this.admin = null;
    this.lastActivity = null;
};

//Streams
var Streams = {
    streams: {},

    createStream: function(id, title, description, privat, password, callback) {
        var stream = Streams.streams[id];
        if(stream) {
            return null;
        }
        else {
            Streams.streams[id] = new Stream(id, title, description);
            if(privat) {
                Streams.streams[id].privat = true;
            }
            if(password) {
                Streams.streams[id].password = password;
            }
            Streams.streams[id].lastActivity = Math.floor(new Date().getTime() / 1000);
            callback(id);
        }
    },

    getStream: function(id) {
        var stream = Streams.streams[id];
        if(!stream) {
            return null;
        }
        else {
            return stream;
        }
    },

    getAllStreams: function() {
        return Streams.streams;
    },

    checkStreamActivity: function() {
        for(var id in Streams.streams) {
            var stream = Streams.streams[id];
            var time = Math.floor(new Date().getTime() / 1000);
            if(stream.admin === null && time - stream.lastActivity >= 604800) {
                delete Streams.streams[id];
            }
        }
    }

};

// Random id generator
var generateId = function() {
    var id = '';
    var chars = 'abcdefghijklmnopqrstuvwxyz'+
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+
                '0123456789';
    for (var i=0; i<5; i++) {
        var index = Math.floor(Math.random() * chars.length);
        id += chars[index];
    }
    return id;
};

// Socket IO
io.on('connection', function(socket) {
    var streamId = null;
    var currentTime = null;
    Streams.checkStreamActivity();
    socket.on('joinStream', function(id) {
        socket.join(id);
        streamId = id;

        if(streamId && Streams.streams[streamId]) {
            Streams.streams[streamId].users = io.sockets.clients(streamId).length;
            io.sockets.in(streamId).emit('updateStream', Streams.getStream(streamId));

            socket.emit('joinedStream', Streams.getStream(streamId));
        }
    });

    socket.on('createStream', function(id, title, description, privat, password) {
        Streams.createStream(id, title, description, privat, password, function(id) {
            socket.emit('streamCreated', id);
        });
    });

    socket.on('disconnect', function () {
        if(streamId && Streams.streams[streamId]) {
            Streams.streams[streamId].users = io.sockets.clients(streamId).length;
            io.sockets.in(streamId).emit('updateStream', Streams.getStream(streamId));
        }
        if(Streams.streams[streamId]) {
            if(Streams.streams[streamId].admin == socket.id) {
                Streams.streams[streamId].admin = null;
            }
        }
    });

    socket.on('getStream', function() {
        io.sockets.in(streamId).emit('updateStream', Streams.getStream(streamId));
    });

    socket.on('getAllStreams', function() {
        socket.emit('showAllStreams', Streams.getAllStreams());
    });

    socket.on('synchTime', function(time) {
       currentTime = time;
       socket.broadcast.to(streamId).emit('getSynchedTime', currentTime);
    });

    socket.on('updatePlaylist', function(playlist) {
        if(streamId && Streams.streams[streamId]) {
            Streams.streams[streamId].playlist = playlist;
            console.log(Streams.streams[streamId].playlist);
            socket.broadcast.to(streamId).emit('updatePlaylist', Streams.streams[streamId].playlist);
        }
    });

    socket.on('setCurrentVideo', function(videoID) {
        var currentVideo = videoID;
        Streams.streams[streamId].currentVideo = videoID;
        socket.broadcast.to(streamId).emit('loadCurrentVideo', currentVideo);
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(streamId).emit('updatechat', socket.username, data);
    });

    socket.on('setuser', function(username){
		socket.username = username;
        socket.emit('updatechat', 'SERVER', 'Hi '+socket.username + " in " + streamId);
	});

    socket.on('checkPassword', function(enteredPassword) {
        var thisPassword = enteredPassword;
        if(Streams.streams[streamId].password == thisPassword) {
            socket.emit('grantAdminRights', streamId);
        }
        else {
            socket.emit('grantAdminRights', false);
        }
    });

    socket.on('newState', function(newState) {
        console.log("NewState Server", newState);
        var currentState = newState;
        socket.broadcast.to(streamId).emit('setNewState', currentState);
    });

    socket.on('setAdmin', function() {
        if(streamId && Streams.streams[streamId]) {
            Streams.streams[streamId].admin = socket.id;
            Streams.streams[streamId].lastActivity = Math.floor(new Date().getTime() / 1000);
        }
    });
});
