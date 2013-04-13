(function(){
  var graphs = {
    temperature : [],
    humidity : []
  }
  var tempData = []
  var humidData = []
  var timeData = []
  var tempRange = []
  var humidRange = []
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  var currentClockRotation = [0,0]
  var tempAverages = {}
  var humidAverages = {}
  
  var swipeFactor = 0.3
  var zoomFactor = 0.5
  
  var maxZoom = 1000
  var minZoom = 5
  var zoom = 10
  var minStart = 0
  var maxStart = 0
  var start = 0
  var datapoints = 0
  
  var graphDefaults = {
    zoom : zoom,
    startIndex : 0,
    element : "viz",
    startPosition : 100,
    minHeight : 20,
    height: 150
  }
  
  $(function(){
    if(typeof vizData == 'undefined') return
    // set up the data
    var i=0,len=vizData.length
    var datapoints = len
    maxStart = len - zoom
    for(i;i<len;i++){
      // don't use invalid data (like the header)
      if(isNaN(parseFloat(vizData[i][1]))) continue
      var d = new Date(vizData[i][0])
      var t = parseFloat(vizData[i][1])
      var h = parseFloat(vizData[i][2])
      timeData.push(d)
      tempData.push(t)
      humidData.push(h)
      if(t<tempRange[0] || !tempRange[0]) tempRange[0] = t
      if(t>tempRange[1] || !tempRange[1]) tempRange[1] = t
      if(h<humidRange[0] || !humidRange[0]) humidRange[0] = h
      if(h>humidRange[1] || !humidRange[1]) humidRange[1] = h
      var timeKey = d.getHours() +""+ d.getMinutes()
      tempAverages[timeKey] = tempAverages[timeKey] || []
      tempAverages[timeKey].push(t)
      humidAverages[timeKey] = humidAverages[timeKey] || []
      humidAverages[timeKey].push(h)
    }
    // calculate averages
    for(var k in tempAverages){
      if(!tempAverages.hasOwnProperty(k)) continue
      var tsum = 0
      var hsum = 0
      var i=0,len=tempAverages[k].length
      for(i;i<len;i++){
        tsum += tempAverages[k][i]
        hsum += humidAverages[k][i]
      }
      tempAverages[k] = tsum/len
      humidAverages[k] = hsum/len
    }
    initializeGraphs(tempData,humidData,zoom)
    redraw()
    // events
    $("#temp,#humid").on('mousedown',function(){
      var newClass = $(this).is('#temp') ? "temp" : "humid"
      var number = parseInt($(this).find('.avg span').html())
      $("#averageIndicator").removeClass('temp').removeClass('humid').addClass(newClass)
      updateAverage(number,newClass)
    })
    
    var down = false
    $("body")
      .on('mousedown touchstart',function(e){
        if(down) return false
        try {
          e.clientX = e.originalEvent.touches[0].clientX
          e.clientY = e.originalEvent.touches[0].clientY
        } catch(e){}
        down = true
        var startPos = [e.clientX,e.clientY]
        var mouseIndicator = $("#mouseIndicator").fadeIn(200)
        mouseIndicator.css({left : startPos[0] - mouseIndicator.width()/2,top : startPos[1] - mouseIndicator.height()/2})
        $("body").on('mousemove touchmove',function(e){
          try {
            e.clientX = e.originalEvent.touches[0].clientX
            e.clientY = e.originalEvent.touches[0].clientY
          } catch(e){}
          var newPos = [e.clientX,e.clientY]
          mouseIndicator.css({left : newPos[0] - mouseIndicator.width()/2,top : newPos[1] - mouseIndicator.height()/2})
          // figure out direction of move
          var leftMovement = startPos[0] - newPos[0]
          var upMovement = startPos[1] - newPos[1]
          if(Math.abs(leftMovement) >= Math.abs(upMovement)){
            // moving l/r
            var startFloat = leftMovement * swipeFactor
            var newStart = start + Math.round(startFloat)
            if(newStart < maxStart && newStart > minStart){
              start = newStart
              // move the ticks with the scroll. TODO: this is innacurate...
              var ticks = $("#ticks")
              var tickMovement = (startFloat - Math.round(startFloat))*ticks.find('.tick').width()
              ticks.css("left",tickMovement)
              redraw()
            }
          } else {
            // moving up/down
            var zoomNum = Math.round(upMovement * zoomFactor)
            var newZoom = zoom + zoomNum
            if(newZoom < maxZoom && newZoom > minZoom){
              zoom = newZoom
              maxStart = datapoints - zoom
              redraw()
            }
          }
          startPos = newPos
          // don't fire scroll events
          return false
        })
      })
      .on('mouseup touchend',function(e){
        $("body").off('mousemove touchmove')
        down = false
        $("#mouseIndicator").fadeOut(200)
      })
    })
  
  var updateAverage = function(num,type){
    var range = type == 'humid' ? humidRange : tempRange
    console.log(type,range)
    var height = ((((num-range[0])/range[1])*graphDefaults.height) + graphDefaults.minHeight)*2
    $("#averageIndicator." + type).css({height : height, "margin-top" : "-" + (height/2) + 'px'})
  }
  
  // redraw
  var redraw = function(){
    var t=0
    var ticks = $("#ticks").html('')
    for(t;t<zoom;t++){
      ticks.append('<li class="tick"><i></i><p></p></li>')
    }
    ticks = ticks.find('.tick')
    var tickwidth = $("#viz").width()/ticks.length
    var currentIndex = start + Math.floor(ticks.length/2)
    var currentTime = timeData[currentIndex]
    var averageKey = currentTime.getHours() + "" + currentTime.getMinutes()
    var temp = $("#temp")
    temp.find('.big').html(Math.round(tempData[currentIndex]))
    var tavg = tempAverages[averageKey]
    temp.find(".avg span").html(Math.round(tavg))
    updateAverage(tavg,'temp')
    var humid = $("#humid")
    humid.find('.big').html(Math.round(humidData[currentIndex]))
    var havg = humidAverages[averageKey]
    humid.find(".avg span").html(Math.round(havg))
    updateAverage(havg,'humid')
    setDate(currentTime)
    setClockTime(currentTime)
    ticks.css('width',tickwidth)
    graphs.temperature[0].slice(start,zoom)
    graphs.temperature[1].slice(start,zoom)
    graphs.humidity[0].slice(start,zoom)
    graphs.humidity[1].slice(start,zoom)
  }
  // set Date
  var setDate = function(time){
    var month = months[time.getMonth()]
    var day = time.getDate()
    $("#date .month").html(month)
    $("#date .day").html(day)
    var hour = time.getHours()
    var minute = time.getMinutes()
    if(hour.toString().length == 1) hour = "0"+hour
    if(minute.toString().length == 1) minute = minute+"0"
    $("#time .hours").html(hour)
    $("#time .minutes").html(minute)
  }
  // set clock time
  var setClockTime = function(time){
    var minutes = (time.getMinutes()/60)*360
    var hours = (time.getHours()/12 + ((time.getMinutes()/60)/12))*360
    currentClockRotation = [hours,minutes]
    // TODO: rotate the proper direction relative to the current direction. (clockwise for foward)
    $(".clock .arr b:nth-child(1), .clock .arr b:nth-child(2)").css("-webkit-transform","rotate("+hours+"deg)")
    $(".clock .arr b:nth-child(3), .clock .arr b:nth-child(4)").css("-webkit-transform","rotate("+minutes+"deg)")
  }
  
  // set up
  var initializeGraphs = function(tempData,humidData,zoom){
    var defaults = graphDefaults
    // set up graphs
    var humidGraphTop = new Graph(getGraphOptions(defaults,{
      data : humidData,
      color : "#2e989f",
      reverse : false,
      min : humidRange[0],
      max : humidRange[1]
    }))
    humidGraphTop.draw()
    graphs.humidity.push(humidGraphTop)
    var humidGraphBottom = new Graph(getGraphOptions(defaults,{
      data : humidData,
      color : "#2e989f",
      reverse : true,
      min : humidRange[0],
      max : humidRange[1]
    }),humidGraphTop.viz)
    humidGraphBottom.draw()
    graphs.humidity.push(humidGraphBottom)
    var tempGraphTop = new Graph(getGraphOptions(defaults,{
      data : tempData,
      color: "#ffba00",
      reverse : false,
      min : tempRange[0],
      max : tempRange[1]
    }),humidGraphTop.viz)
    tempGraphTop.draw()
    graphs.temperature.push(tempGraphTop)
    var tempGraphBottom = new Graph(getGraphOptions(defaults,{
      data : tempData,
      color: "#ffba00",
      reverse : true,
      min : tempRange[0],
      max : tempRange[1]
    }),humidGraphTop.viz)
    tempGraphBottom.draw()
    graphs.temperature.push(tempGraphBottom)
  }
  var getGraphOptions = function(defaults,options){
    for(var o in defaults){
      if(!defaults.hasOwnProperty(o)) continue
      options[o] = options[o] || defaults[o]
    }
    return options
  }
})()