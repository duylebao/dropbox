let fs = require('fs');
let archiver = require('archiver');
let rimraf = require('rimraf');
let mime = require('mime');
let path = require('path');
let {dir} = require('yargs')
            .default('dir', __dirname)
            .argv;

exports.mkdir = function(p, callback){
    let filePath = path.join(dir, p);
    fs.exists(filePath, function(exists) { 
        if (exists) { 
            callback(new Error(`${p} already exist`));
            return;
        }
        fs.mkdir(path.join(dir, p), function(err){
            if (err){
                callback(err.message);
            }else{
                callback(null);
            }
        });
    });
};

exports.listFiles = function(p, callback){
    fs.readdir(path.join(dir, p), function(err, files){
        if (err){
            callback(err.message);
        }else{
            let result = [];
            files.forEach( function(file){
                if (!fs.statSync( path.join(p, file)).isDirectory()){
                    result = result.concat(file);
                }
            });
            callback(null, JSON.stringify(result));
        }
    });
};

exports.createArchive = function(p, format, output, callback){
    let archive = archiver(format);
    archive.pipe(output);
    archive.bulk([
        { expand: true, cwd: path.join(dir, p), src: ['**'], dest: 'source'}
    ]);
    archive.on('error', function(err){
        callback(err);
    });
    archive.finalize();
};

exports.create = function(p, data, callback){
    let filePath = path.join(dir, p);
    if (isDirPath(filePath)){
        exports.mkdir(p, callback);
    }else{
        fs.exists(filePath, function(exists) { 
            if (exists) { 
                callback(new Error(`${p} already exist`));
                return;
            }
            let stream = fs.createWriteStream(filePath);
            stream.once('open', function(fd) {
                stream.write(data);
                stream.end();
            });
            callback(null);
        });
    }
};

exports.replaceFile = function(p, data, callback){
    let filePath = path.join(dir, p);
    if (isDirPath(filePath)){
        callback(new Error('not allowed'));
    }else{
        fs.exists(filePath, function(exists) { 
            if (!exists) { 
                callback(new Error(`${p} does not exist`));
                return;
            }
            fs.truncate(filePath, 0, function(){
                let stream = fs.createWriteStream(filePath);
                    stream.once('open', function(fd) {
                    stream.write(data);
                    stream.end();
                    callback(null);
                });
            });
        });
    }
};

exports.remove = function(p, callback){
    let filePath = path.join(dir, p);
    fs.exists(filePath, function(exists) { 
        if (!exists) { 
            callback(new Error(`${p} does not exist`));
            return;
        }
        rimraf(filePath, function(err){
            callback(err);
        });
    });
};

exports.read = function(p, callback){
    if (isDirPath(p)){
        exports.listFiles(p, callback);
    }else{
        fs.readFile(path.join(dir, p), function (err,data) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, data);
        });
    }
};

exports.fileInfo = function(p, callback){
    fs.stat(path.join(dir, p), function(err, stat) {
        if(err) {
            callback(err);
            return;
        }
        let mtype = mime.lookup(path.join(dir,p));    
        callback(null, {
            "size" : stat.size,
            "mime" : mtype
        });    
    });
};

function isDirPath(p){
    return p.indexOf('/', p.length - p.length) !== -1;
}
