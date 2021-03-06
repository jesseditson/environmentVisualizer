var config = require('config-heroku')
var express = require('express')
var ecstatic = require('ecstatic')
var http = require('http')
var routes = require('./routes')
var fs = require('fs')
var ejsHelpers = require('./lib/ejs-helpers')
var toobusy = require('toobusy')

toobusy.maxLag(config.maxTooBusyLag || 70)

// Local Vars
var pkg = JSON.parse(fs.readFileSync('package.json'))
var favicon = __dirname + "/public/images/favicon.ico"

var app = express()

app.configure(function(){
  app.disable('x-powered-by');
  app.engine('ejs', require('ejs-locals'))
  app.set('port', config.port, process.env.PORT || 3000)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon(favicon))
  if(config.environment == 'production'){
    app.use(function(req,res,next){
      if(!toobusy()) return next()
      res.send(503, "Oh noez, too many people on the site!")
    })
  }
  if(config.requestLogger !== false){
    app.use('logger',express.logger(config.environment == 'development' ? (typeof config.requestLogger != 'undefined' ? config.requestLogger : 'dev') : 'default'))
  }
  // set up templating
  app.use(ejsHelpers.middleware)
  app.use(express.methodOverride())
  // send location headers
  app.use(function(req,res,next){
    // ajax won't see 302, so we need this to send redirects to ajax calls.
    res.set('x-location',req.url)
    next()
  })
  // static routes
  app.use(function(req,res,next){
    // allow all 
    res.setHeader("Access-Control-Allow-Origin","*")
    next()
  })
  app.use(ecstatic({root:__dirname + '/public'}))
  // main routes
  app.use(app.router)
  // 404
  app.use(function(req,res){
    res.render('404',{status : 404})
  })
})

app.configure('development', function(){
  app.use(express.errorHandler())
})
ejsHelpers(app)
routes(app)

var port = process.env.PORT || app.get('port')

http.createServer(app).listen(port, function(){
  console.log("Server listening on port " + port)
})

// handle uncaught exceptions without crashing
process.on('uncaughtException',function(e){
  console.error("Uncaught Exception:",e.stack)
})
