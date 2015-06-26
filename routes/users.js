var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  	console.log(req.query);
 
	var outputFilename = 'public/tmp/1.json';
 
	fs.writeFile(outputFilename, JSON.stringify(req.query, null, 4), function(err) {
	    if(err) {
	      	console.log(err);
	    } else {
	      	console.log("JSON saved to " + outputFilename);
	    }
	});
	
});

module.exports = router;
