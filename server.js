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
    })
    res.redirect( 302, '/rooms/' + id );
});

io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});


server.listen(port);
