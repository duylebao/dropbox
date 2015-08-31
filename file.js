let fs = require('fs');
let archiver = require('archiver');
let rimraf = require('rimraf');
let mime = require('mime');
let path = require('path');
// let {dir} = require('yargs')
//             .default('dir', __dirname)
//             .argv;

exports.createDirectory = function(dir, p, callback){
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

exports.listFiles = function(dir, p, callback){
    let filePath = path.join(dir, p);
    fs.exists(filePath, function(exists){
        if (!exists){
            console.log('not exist');
            return callback(new Error(`directory ${p} does not exist`));
        }
        fs.readdir(filePath, function (err, files) {
            if (err){
                return callback(err);
            }
            let counter = files.length;
            let errored = false
            let result = [];
     
            files.forEach(function (file, index){
                let fullPath = path.join(filePath, file);
                fs.stat(fullPath, function (err, stat) {
                    if (errored){
                        return;
                    }
                    if (err){
                        errored = true;
                        return callback(err);
                    }
                    if (!stat.isDirectory()){
                        result.push(file);
                    }
                    if (--counter == 0) {
                        callback(null, result);
                    }
                });
            });
        });          
    });  
};

exports.createArchive = function(dir, p, format, callback){
    let archive = archiver(format);
    archive.bulk([
        { expand: true, cwd: path.join(dir, p), src: ['**'], dest: 'source'}
    ]);
    archive.on('error', function(err){
        callback(err);
    });
    archive.finalize();
    callback(null, archive);
};

exports.createFile = function(dir, p, data, callback){
    let filePath = path.join(dir, p);
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
};

exports.replaceFile = function(dir, p, data, callback){
    let filePath = path.join(dir, p);
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
};

exports.remove = function(dir, p, callback){
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


exports.readFile = function(dir, p, callback){
    console.log('readfile:', dir, p);
    fs.readFile(path.join(dir, p), function (err,data) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, data);
    });
};

exports.fileInfo = function(dir, p, callback){
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

exports.isDirPath = function(p){
    return p.indexOf('/', p.length - 1) !== -1;
};
