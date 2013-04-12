(function(){
  var graphs = {
    temperature : [],
    humidity : []
  }
  $(function(){
    if(typeof vizData == 'undefined') return
    // set up the data
    var tempData = []
    var humidData = []
    var timeData = []
    var i=0,len=vizData.length
    for(i;i<len;i++){
      // don't use invalid data (like the header)
      if(isNaN(parseFloat(vizData[i][1]))) continue
      timeData.push(new Date(vizData[i][0]))
      tempData.push(vizData[i][1])
      humidData.push(vizData[i][2])
    }
    initializeGraphs(tempData,humidData)
    // UI initialization
    $("#timeslider").attr('max',timeData.length)
    // events
  })
  
  // set up
  var initializeGraphs = function(tempData,humidData){
    // set up graphs
    var defaults = {
      zoom : 50,
      startIndex : 0,
      max : 100,
      element : "viz",
      startPosition : 100,
      height: 200
    }
    var tempGraphTop = new Graph(getGraphOptions(defaults,{
      data : tempData,
      color: "#ef8d31",
      reverse : false,
      max : 60
    }))
    tempGraphTop.draw()
    graphs.temperature.push(tempGraphTop)
    var tempGraphBottom = new Graph(getGraphOptions(defaults,{
      data : tempData,
      color: "#ef8d31",
      reverse : true,
      max : 60
    }),tempGraphTop.viz)
    tempGraphBottom.draw()
    graphs.temperature.push(tempGraphBottom)
    var humidGraphTop = new Graph(getGraphOptions(defaults,{
      data : humidData,
      color : "#88bfe8",
      reverse : false
    }),tempGraphTop.viz)
    humidGraphTop.draw()
    graphs.humidity.push(humidGraphTop)
    var humidGraphBottom = new Graph(getGraphOptions(defaults,{
      data : humidData,
      color : "#88bfe8",
      reverse : true
    }),tempGraphTop.viz)
    humidGraphBottom.draw()
    graphs.humidity.push(humidGraphBottom)
  }
  var getGraphOptions = function(defaults,options){
    for(var o in defaults){
      if(!defaults.hasOwnProperty(o)) continue
      options[o] = options[o] || defaults[o]
    }
    return options
  }
})()