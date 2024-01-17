const fs = require('fs');
const { start } = require('repl');

const path = require("path");
var target = process.env.TARGET_FOLDER_NAME ? process.env.TARGET_FOLDER_NAME : 'node_modules';
var mytargetpath = process.env.TARGET_PATH ? process.env.TARGET_PATH : '../';


fs.exists(mytargetpath, (exists) => {
    exists ?
    fs.open(mytargetpath, 'r', (err, fd) => {
        if (err) throw err;
        fs.fstat(fd, (err, stat) => {
          if (err) throw err;
          // use stat
          if (stat.isDirectory()) {
            processFolder(mytargetpath);
          } else {
            console.log(stat.isDirectory());
            console.log(mytargetpath + " is not a directory")
          }
          // always close the file descriptor!
          fs.close(fd, (err) => {
            if (err) throw err;
          });
        });
      })
      :
      console.log('no ' + mytargetpath + '!');
  });
  
  let mycounter = ()=>{
    let counter = 0;
    return ()=>{
        console.log('------- completed  ------------\ndeleted targetfolders: '+ ++counter);
        return counter;
    }
}
  
  let counter = mycounter();
  
  var processFolder = (path) => {
    fs.readdir(path, (err, files) => {
      files.forEach(entry => {
        fs.stat(path + '/' + entry, (err, stats) => {
          if (err) throw err;
          if (entry == target && stats.isDirectory()) {
            removeDir(path + '/' + entry);
            counter();
          } else if (stats.isDirectory()) {
            // console.log('------- processFolder('+path+'/'+entry+')  ------------');
            processFolder(path + '/' + entry);
        }
    });
    
}

);

    })
  
  }


/**  
 * example from https://coderrocketfuel.com/article/remove-both-empty-and-non-empty-directories-using-node-js
 * */




const removeDir = function (path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function (filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    console.log("Directory path not found.")
  }
}




/**
 * A lot is going on here, so let's break down each section.

The removeDir function is what we use to recursively remove a parent directory and it's files and sub-directories. The only parameter is the path to the parent directory.

Inside the removeDir function, the first thing we do is use the fs.existsSync() to verify that the directory we passed to our function exists. If it doesn't exist, we end the function and log an error message.

Then, we pass our directory path to the fs.readdirSync() function to get an array of all the files and sub-directories inside the parent directory. And we store that array in a variable named files.

If the array is empty, that means the directory is empty and we can use the fs.rmdirSync() function to delete it.

If the array.length > 0, we loop through the files array with the forEach() function. For each item in the files array, we check whether or not the item is a file or a sub-directory.

If the item is a sub-directory, we have the function recursively call itself with removeDir(), with the path of the sub-directory as a parameter. That function will loop through the sub-directory and remove it's children files and directories.

And if the item is a file, we simply use the fs.unlinkSync() to remove the file, with the path to the file given as a parameter.

When the .forEach() loop has finished and all the files have been removed, you can delete the now empty directory with the fs.rmdirSync() function.

Then we call our removeDir(pathToDir) function with the path to the parent directory as a parameter.

When you run the code, you should see that the directory in question is removed.

If you don't want to deal with writing your own function for this, there are is the Fs-Extra NPM package that makes this much easier to do.

That package provides functionality built specifically for this problem.
 */