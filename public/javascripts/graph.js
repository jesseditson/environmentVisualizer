var Graph = function(options,viz){
  if(typeof Raphael == 'undefined') throw new Error("Could not find Raphael.js - please import it before using graph.js.")
  if(!options.data || !Array.isArray(options.data)) throw new Error("Please pass a data array to each new Graph.")
  if(typeof $ == 'undefined') throw new Error("Could not find jQuery or Zepto - please import one before using graph.js.")
  options.zoom = options.zoom || 100
  options.startIndex = options.startIndex || 0
  options.max = options.max || 100
  options.min = options.min || 20
  options.startPosition = options.startPosition || 0
  var el = $("#" + options.element)
  options.x = options.x || 0
  options.height = options.height || el.height()
  options.width = options.width || el.width()
  options.color = options.color || "#88bfe8"
  options.opacity = options.opacity || 0.6
  options.reverse = options.reverse === false ? false : true
  options.minHeight = options.minHeight || 20
  this.options = options
  if(viz) this.viz = viz
}

// public

Graph.prototype.draw = function(data){
  var options = this.options
  var x = options.x
  var subdata = options.data.slice(options.startIndex,options.startIndex+options.zoom)
  var sectionSize = options.width/(options.zoom-1)
  // path to the start point
  var start = options.startPosition
  var path = "M " +x+ " "+start+" L " +x+ " " + getPoint.call(this,subdata[0])
  // generate the rest of the paths
  var p=1, len=subdata.length
  for(p;p<len;p++){
    var point = subdata[p]
    x += sectionSize
    path += " L " + x + " " + getPoint.call(this,point)
    lastPoint = point
  }
  // go back to the center line
  path += " L "+x+" "+start
  // close the lines
  path += " z"
  // draw
  this.viz = this.viz || Raphael(options.element,options.width,options.height*2)
  if(this.path){
    this.path.attr({path:path})
  } else {
    this.path = this.viz.path(path)
    this.path.attr({
      "fill" : options.color,
      "fill-opacity" : options.opacity,
      "stroke" : 0
    })
  }
}

Graph.prototype.slice = function(start,zoom){
  this.options.startIndex = start,
  this.options.zoom = zoom
  this.draw()
}

Graph.prototype.setData = function(data){
  this.data = data
  this.draw()
}

// private

var getPoint = function(point){
  point = parseFloat(point)
  var n = (((point-this.options.min)/this.options.max)*this.options.height)+this.options.minHeight
  if(this.options.reverse === true){
    n = this.options.startPosition + n
  } else {
    n = this.options.startPosition - n
  }
  return n
}