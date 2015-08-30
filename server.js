let Hapi = require('hapi');
let File = require( './file');
let Stream = require('stream').Writable();
let net = require('net');
let JsonSocket = require('json-socket');
let tcpServer = net.createServer();
let chokidar = require('chokidar');
let server = new Hapi.Server();

tcpServer.listen(8001);
tcpServer.on('connection', function(socket) {
    socket = new JsonSocket(socket);
    chokidar.watch(File.filePath(), {ignored: /[\/\\]\./})
        .on('all', (event, path) => {
            let isDir = event.indexOf("Dir") != -1;
            let action = event.replace('Dir','').replace('unlink','delete');
            let message = {
                "action": action,
                "path": path.replace(File.filePath(),''),
                "type": isDir ? 'dir' : 'file'
            };
            socket.sendMessage( message );
        })
});

server.connection({ 
    host: 'localhost', 
    port: 8000 
});

server.start(function() {
     console.log('Server running at:', server.info.uri);
});

server.route({
    method: 'GET',
    path: '/{path*}', 
    handler: function (request, reply) {
        let method = request.method;
        let path = request.params.path;
        if (typeof path === 'undefined'){
            path = '/';
        }  
        if (method === 'head'){
            File.fileInfo(path, function(err, info){
                if (err){
                    console.log(`${path} does not exist`);
                    reply();
                }else{
                    reply()
                        .header('Content-Length', info.size)
                        .header('Content-Type', info.mime);
                    };
            });
            return;
        }     
        let accept = request.headers['accept'] === 'application/x-gtar';
        if (accept){       
            File.createArchive(path, 'tar', function(err, data){
                if (err){
                    reply(err.message);
                }else{
                    reply(data);
                }
            });
        }else{
            File.read(path, function(err, data){
                if (!err){
                    console.log(`loading file ${path}`);
                    reply(data);
                }else{
                    console.log(`could not load file ${path}: ${err}`);
                    reply(`${path} does not exist`);
                }
            });
        }
    }
});

server.route({
    method: 'PUT',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        let data = request.payload;
        File.create(path, data, function(err){
            if (err){
                reply(err.message).code(405);
            }else{
                reply('created');
            }
        });
    }
});

server.route({
    method: 'POST',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        let data = request.payload;
        File.replaceFile(path, data, function(err){
            if (err){
                reply(err.message).code(405);
            }else{
                reply('updated');
            }
        });
    }
});

server.route({
    method: 'DELETE',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        File.remove(path, function(err){
            if (err){
                reply(err.message);
            }else{
                reply('deleted');
            }
        });
    }
});