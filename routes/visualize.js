var path = require('path')
var fs = require('fs')
var csv = require('csv')
var Stream = require('stream')

// local vars
var datafilePath = '../datafiles'

var render = function(req,res,err,data){
  res.render('visualize',{error : err && err.message, data : data})
}

var visualize = function(req,res,next){
  var filename = path.join(__dirname, datafilePath, decodeURIComponent(req.params.filename))
  
  // csv stream
  var data = []
  csv()
    .from.stream(fs.createReadStream(filename))
    .on('record',function(row,index){
      data[index] = row
    })
    .on('end', function(count){
      render(req,res,null,data)
    })
    .on('error', function(error){
      render(req,res,error)
    })
}

module.exports = function(app){
  app.get('/visualize/:filename',visualize)
}