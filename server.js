let Hapi = require('hapi');
let File = require( './file');

let server = new Hapi.Server();
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
        File.readFile(path, function(err, data){
            if (!err){
                console.log(`loading file ${path}`);
                reply(data);
            }else{
                console.log(`could not load file ${path}: ${err}`);
                reply(`${path} does not exist`);
            }
        });
    }
});