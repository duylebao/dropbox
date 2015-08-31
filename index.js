let Hapi = require('hapi');
let File = require( './file');
let Stream = require('stream').Writable();
let net = require('net');
let JsonSocket = require('json-socket');
let tcpServer = net.createServer();
let chokidar = require('chokidar');
let server = new Hapi.Server();
let {dir} = require('yargs')
            .default('dir', __dirname)
            .argv;

tcpServer.listen(8001);
tcpServer.on('connection', function(socket) {
    socket = new JsonSocket(socket);
    chokidar.watch(dir, {ignored: /[\/\\]\./})
        .on('all', (event, path) => {  
            let isDir = event.indexOf("Dir") != -1;
            let action = event.replace('Dir','').replace('unlink','delete');
            let message = {
                "action": action,
                "path": path.replace(dir,''),
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
        let isDir = File.isDirPath(path);
        if (method === 'head'){
            File.fileInfo(dir, path, function(err, info){
                if (err){
                    console.log(`${dir}/${path} does not exist`);
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
            File.createArchive(dir, path, 'tar', function(err, data){
                if (err){
                    reply(err.message);
                }else{
                    reply(data);
                }
            });
        }else{
            if (isDir){
                File.listFiles(dir, path, function(err, data){
                    if (err){
                        reply(err.message);
                    }else{
                        reply( JSON.stringify(data));
                    }
                });
            }else{
                File.readFile(dir, path, function(err, data){
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
    }
});

server.route({
    method: 'PUT',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        let data = request.payload;
        let isDir = File.isDirPath(path);
        if (isDir){
            File.createDirectory(dir, path, function(err){
                if (err){
                    reply(err.message).code(405);
                }else{
                    reply('directory created');
                }
            });
        }else{
            console.log('create file', path, data);
            File.createFile(dir, path, data, function(err){
                if (err){
                    reply(err.message).code(405);
                }else{
                    reply('file created');
                }
            });
        }
    }
});

server.route({
    method: 'POST',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        let data = request.payload;
        let isDir = File.isDirPath(path);
        if (isDir){
            reply('update directory is not allowed').code(405);
        }else{
            File.replaceFile(dir, path, data, function(err){
                if (err){
                    reply(err.message).code(405);
                }else{
                    reply('updated');
                }
            });
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/{path*}', 
    handler: function (request, reply) {
        let path = request.params.path;
        File.remove(dir, path, function(err){
            if (err){
                reply(err.message);
            }else{
                reply('deleted');
            }
        });
    }
});
