let net = require('net');
let JsonSocket = require('json-socket');
let request = require('request');
let port = 8001;
let host = '127.0.0.1';
let socket = new JsonSocket(new net.Socket());

let File = require( '../file');
let path = require('path');
let {dir} = require('yargs')
            .default('dir', __dirname)
            .argv;

socket.connect(port, host);
socket.on('connect', function() {
    console.log('client connected');

    socket.on('message', function(message) {
        if (message.type === 'dir'){
            if (message.action === 'add'){
                File.mkdir(`${message.path}/`, function(err){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log(`Directory ${message.path}/ created.`);
                    }
                });
            }else if (message.action === 'delete'){
                File.remove(`${message.path}/`, function(err){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log(`Directory ${message.path}/ removed.`);
                    }
                });
            }
        }else{
            if (message.action === 'add'){
                let url = `http://localhost:8000${message.path}`;
                console.log('url:'+ url);
                request({
                    url: url,
                    method: 'GET',
                    // headers: { //We can define headers too
                    //     'Content-Type': 'MyContentType',
                    //     'Custom-Header': 'Custom Value'
                    // }
                }, function(error, response, body){
                    if(error) {
                        console.log(error);
                    } else {
                        File.create(message.path, body, function(err){
                            if (err){
                                File.replaceFile(message.path, body, function(err){
                                    if (err){
                                        console.log('cannot replace file', message.path);
                                    }else{
                                        console.log('success replacing file', message.path);
                                    }
                                });
                            }else{
                                console.log('success creating file', message.path);
                            }
                        });
                    }
                });
            }else if (message.action === 'delete'){
                File.remove(`${message.path}`, function(err){
                    if (err){
                        console.log(err.message);
                    }else{
                        console.log(`File ${message.path} removed.`);
                    }
                });
            }
        }
    });
});
