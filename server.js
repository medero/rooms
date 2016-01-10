var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    fs = require('fs'),
    port = 3001;


function generateHash(length) {
    if ( !length ) length = 5;

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.set('view engine', 'hbs');

var rooms = [];

app.get('/', function( req, res ) {
    res.render('index', { rooms: rooms });
});

function findRoom(id) {
    var found = false;
    rooms.forEach(function(room){
        if ( id === room.id ) {
            found = room;
        }
    });

    return found;
}

app.get('/rooms/:id', function( req, res ) {
    var id = req.params.id;
    var room = findRoom( id );
    if ( !room ) {
        res.render('404');
    } else {
        res.render('room', { room: room } );
    }
});

app.get('/create-room', function( req, res ) {
    var id = generateHash();
    rooms.push({
        id: id,
        users: []
    });
    res.redirect( 302, '/rooms/' + id );
});

io.on('connection', function(socket) {

    console.log('connection' + socket.handshake.url);

    socket.on('userJoin', function(room) {
        console.log('god');
        var id = room.id;
        if ( findRoom( id ) ) {
            findRoom(id).users.push( socket.id );

            socket.join(id);

            io.emit('getUsers', { roomId: id, users: findRoom(id).users });

            //socket.broadcast.emit('getUsers', { users: findRoom(id).users });
        }
    });

    socket.on('startGame', function() {
        var a = [1,2,3,4,5,6,7,8,9];
        io.emit('receiveGame', { puzzle: a });
    });

    socket.on('disconnect', function() {
        rooms.forEach(function(room) {
            var index = room.users.indexOf ( socket.id );
            if ( index != -1 ) {
                var removed = room.users.splice( index, 1 );
                console.log('user removed ' + removed + ' from ' + room.id );
                io.emit('userLeft', {roomId: room.id });
            }
        });
    });
});


server.listen(port);
