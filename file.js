let fs = require('fs');
let archiver = require('archiver');
let rimraf = require('rimraf');
let mime = require('mime');

exports.mkdir = function(dir){
    fs.mkdir(dir, function(err){
        if (err){
            console.log(err);
        }
        console.log('creating ' + dir);
    });
};

exports.listFiles = function(dir, callback){
    fs.readdir(dir, function(err, files){
        if (err){
            console.log('cannot read dir: ' + err);
        }else{
            let result = [];
            files.forEach( function(file){
                if (!fs.statSync(dir+'/'+file).isDirectory()){
                    result = result.concat(file);
                }
            });
            callback(result);
        }
    });
};

exports.createArchive = function(dir, format, output, callback){
    let archive = archiver(format);
    archive.pipe(output);
    archive.bulk([
        { expand: true, cwd: dir, src: ['**'], dest: 'source'}
    ]);
    archive.on('error', function(err){
        callback(err);
    });
    archive.finalize();
};

exports.createFile = function(path, data, callback){
    fs.exists(path, function(exists) { 
        if (exists) { 
            callback(new Error(`${path} already exist`));
            return;
        }
        let stream = fs.createWriteStream(path);
        stream.once('open', function(fd) {
            stream.write(data);
            stream.end();
        });
        callback(null);
    });
};

exports.remove = function(path, callback){
    fs.exists(path, function(exists) { 
        if (!exists) { 
            callback(new Error(`${path} does not exist`));
            return;
        }
        rimraf(path, function(err){
            callback(err);
        });
    });
};

exports.readFile = function(path, callback){
    fs.readFile(path, function (err,data) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, data);
    });
};

exports.fileInfo = function(path, callback){
    fs.stat(path, function(err, stat) {
        if(err) {
            callback(err);
            return;
        }
        let mtype = mime.lookup(path);    
        callback(null, {
            "size" : stat.size,
            "mime" : mtype
        });    
    });
};
