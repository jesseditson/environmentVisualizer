var wrench = require('wrench')
var fs = require('fs')
var async = require('async')

var datafiles = []

var setupSelect = function(err){
  if(err) throw err
  // main route
  this.app.get('/*',function(req,res,next){
    res.render('select',{availableFiles : datafiles})
  })
}

module.exports = function(app){
  async.parallel([
    function(done){
      // scan the current directory recursively and set up any js files as routes
      wrench.readdirRecursive(__dirname, function(error, files) {
        if(!files) return
        if(error) return done(error)
        ;(files || []).forEach(function(file){
          if(/^index/.test(file) || !/\.js$/.test(file)) return
          // require js files
          var route = require('./' + file)
          if(typeof route != "function") return console.warn("Found route " + file + ", but it does not appear to be a route.")
          route(app)
        })
        done()
      })
    },
    function(done){
      var datafiles = __dirname + '/../datafiles'
      if(!fs.existsSync(datafiles)){
        console.error("ERROR: couldn't find the datafiles folder.")
        console.log(fs.readdirSync(__dirname + '/../'))
        return done()
      }
      wrench.readdirRecursive(datafiles,function(error,files){
        if(!files) return
        if(error) return done(error)
        ;(files || []).forEach(function(file){
          if(/\.csv$/.test(file)){
            datafiles.push({name : file, file : encodeURIComponent(file)})
          }
        })
        done()
      })
    }
  ],setupSelect.bind({app : app}))
}