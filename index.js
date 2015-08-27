let File = require( './file');
let fs = require('fs');

//File.mkdir('duy.pdf');
// File.listFiles('.', function(files){
//    let json = JSON.stringify(files);
//    console.log(json);
//     // for (let i = 0; i < files.length; i++){
//     //     console.log(files[i]);
//     // }
// })

//let output = fs.createWriteStream('target.zip');
// File.createArchive('.', 'zip', output, function(err){

// }

// File.createFile('dle2.txt','this is a test', function(err){
//     if (err){
//         console.log('err:'+err);
//     }else{
//         console.log('success');
//     }
// });

// File.remove('/Users/dle06/tobedeleted/rum', function(err){
//     if (err){
//         console.log('could not remove dir:'+ err);
//     }else{
//         console.log('success');
//     }
// })

File.readFile('dle.txt', function(err, data){
    if (err){
        console.log('could not read file:'+ err);
    }else{
        console.log(data);
        File.createFile('dle_copy.txt', data, function(err){
            if (err){
                console.log('err:'+err);
            }else{
                console.log('success');
            }
        });
    }
})