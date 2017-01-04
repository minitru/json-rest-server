var Q			  = require('q')
  , fs      = require('fs')
  , path 		= require('path')

  , exports = module.exports = {}
  ;


exports.readJSONFile = function(filePath){
  var deferred = Q.defer();
  fs.readFile(filePath, function (error, text) {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      try{
        text = JSON.parse(text);
        deferred.resolve(text);
      }catch(error){
        deferred.reject('Invalid JSON');
      }
    }
  });
  return deferred.promise;
};

// filesList ISN'T BEING CHANGED WITH THE RETURN CODE
// CREATE A NEW LISTING INSTEAD
exports.readDir = function(dirPath, fileExtension){
  var deferred = Q.defer();
  var seanFiles=[]; // SMM TEMP LISTING W/DIRNAMES
  fs.readdir(dirPath, function(error, filesList){
    if (error) {
      deferred.reject(new Error(dirPath + ': ' + error));
    } else {
      filesList = filesList.filter(function(file){
        if(path.extname(file) == fileExtension) {
	  seanFiles.push(dirPath + '/' + file);
          console.log("SEANFILES " + seanFiles.toString());
	  // THIS DOESN'T MATTER - RETURN "banana" AND SEE :)
          return dirPath + '/' + file;	// SMM THIS DOESN'T MATTER
        }
      }); 
      console.log("SEANFILES LENGTH" + seanFiles.length);
      if (seanFiles.length) {
      	// deferred.resolve(filesList);
      	deferred.resolve(seanFiles);
      } else {
	error = "Empty directory";
        console.log("SEANFILES LENGTH ZERO " + " " + error);
        //deferred.reject(new Error(dirPath + ': ' + error));
	// LETS HANDLE IT FURTHER UP THE CHAIN MAYBE...
      	deferred.resolve(seanFiles);
      }
    }
  });
  return deferred.promise;
};

exports.pushContentFiles = function(filesList){
//exports.pushContentFiles = function(seanFiles){
  var deferred 	= Q.defer()
    , contentDir 	= [];

  console.log("CALLING FILELIST");
  filesList.forEach(function(file) {
   console.log("File " + file);
    exports.readJSONFile(file)
      .then(function(content){
        contentDir.push(content);
        if(contentDir.length == filesList.length){
          deferred.resolve( contentDir );
        }
      })
      .catch(function(){
        console.log("ERROR IN FILELIST");
        deferred.reject(new Error(file + ': reading file'));
      })
  });

  if (filesList.length == 0) deferred.resolve( contentDir ); // SMM HACK - HANDLE EMPTY DIRECTORY
  return deferred.promise;
};

exports.reply = function(request, response, status, header, content, filePath){
  if(!response.finished){
    response.writeHead(status, header);
    if(content){
      response.write(content.toString());
    }
    response.end();
    console.log(" -> " + request.method + " " + serverUrl + request.url + ' ' + (status > 299 ? status.toString().red : status.toString().green) + (filePath ? ' -> ' + filePath.cyan : ''));
  }
};
