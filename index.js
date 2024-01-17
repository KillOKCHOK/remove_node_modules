/**
 * https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/
 */

const fs = require('fs');

var target = process.env.TARGET_FOLDER_NAME ? process.env.TARGET_FOLDER_NAME : 'target';
var path = process.env.TARGET_PATH ? process.env.TARGET_PATH : './';

fs.exists(path, (exists) => {
  console.log(path);
  console.log(exists ? path + ' - exists' : 'no ' + path + '!');
});

fs.open(path, 'r', (err, fd) => {
  if (err) throw err;
  fs.fstat(fd, (err, stat) => {
    if (err) throw err;
    // use stat
    if (stat.isDirectory()) {
      console.log(processFolder(path));
      processFolder(path);
    } else {
      console.log(stat.isDirectory());
      console.log(path + " is not a directory")
    }
    // always close the file descriptor!
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });
});


var processFolder = (path) => {
  fs.readdir(path, (err, files) => {
    files.forEach(entry => {
      fs.stat(path + '/' + entry, (err, stats) => {
        if (err) throw err;
        if (entry == target && stats.isDirectory()) {
          console.log('------- processFolder('+path+'/'+entry+')  ------------');
          processTargetFolder(path + '/' + entry)
            // .then((path)=>{})
            // .catch(err=>console.log(err))
            ;
        } else if (stats.isDirectory()) {
          console.log('------- processFolder('+path+'/'+entry+')  ------------');
          processFolder(path + '/' + entry);
        }
      });
    }
    );
  })

}
/**  
 * first create filearray delete all files
 * second create folderarray processTarget foreach
 * third rm currentdir
 * 
 * */
let processTargetFolder = (path) => {

  var bar = new Promise((resolve, reject) => {
    var filearray = [];
    var folderarray = [];
    console.log('------- processTargetFolder(' + path + ')  ------------');
    fs.readdir(path, (err, files) => {
      if (files.length > 0) {
        console.log(files);
        files.forEach((value, index, array) => {
          fs.stat(path + '/' + value, (err, stats) => {
            if (stats.isDirectory()) {
              // console.log('----------concatffolder----------')
              folderarray.push(path + '/' + value);
              // console.log(folderarray)
              if (index === array.length - 1) {
                resolve({ filearray: filearray, folderarray: folderarray, path: path });
              }
            } else {
              // console.log('----------concatfile----------')
              filearray.push(path + '/' + value);
              // console.log(filearray)
              if (index === array.length - 1) {
                resolve({ filearray: filearray, folderarray: folderarray, path: path });
              }
            }

          });
        });
      } else {
        console.log("NO FILES IN " + path);
        console.log("DELETE: " + path);
        // fs.rmdir(path, (err)=>{if(err)console.log(err+" xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")});
        resolve({ filearray: filearray, folderarray: folderarray, path: path });
      }
    });
  });
  return bar.then((arrObj) => {
      processFiles(arrObj.filearray);
      return arrObj;
    })
    .then((arrObj) => {
      return processFolders(arrObj.folderarray, arrObj.path, (path) => {
        // fs.rmdir(path, (err)=>console.log(err));
        // await cb();
        console.log("FUNKTION DELETE: " + path);

      }).then(() => {
        console.log("!!!!!!!!!!!!")
        console.log(arrObj)
        return arrObj;
      });

    })
    .then((arrObj) => {
      // fs.rmdir(arrObj.path, (err)=>console.log(err));
      console.log("Finished processFiles for: " + arrObj.path);
    })
    ;
}

// fs.rmdir(path, (err)=>console.log(err));

let processFiles = (filearray) => {
  filearray.forEach((file) => {
    // fs.unlink(file,()=>console.log(file));
    console.log("DELETE: " + file);
  });
}

let processFolders = (folderarray, path, cb) => {
  var processFoldersPromise = new Promise((resolve, reject) => {
    var promices = [];
    for (let index = 0; index < folderarray.length; index++) {
      let entry = folderarray[index];
      promices.push(processTargetFolder(entry));
      
      if (folderarray.length-1 == index) {
        console.log(index);
        Promise.all(promices).then((path) => { resolve(path) });
      }
    }
      // if(index==folderarray.length-1)resolve(path);
    });
    
    return processFoldersPromise.then((path) => {
      cb(path);
    })
  }

