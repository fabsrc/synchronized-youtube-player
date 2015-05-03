SYPlayer.ClockView = function() {
        
    var that = {},
        clock = null,
        hours = null,
        minutes = null,
    
    
    init = function() {
    
        updateClock();
        setInterval("updateClock()", 5000);

    }

    
    updateClock = function() {
        
        clock = new Date();
        hours = clock.getHours();
        minutes = clock.getMinutes();
        
        if(hours <= 9){
            hours = "0" + hours;
        }
        if(minutes <= 9){
            minutes = "0" + minutes;               
        }
        
        $("#clockTime").html(hours + ":" + minutes);
    }
    
    that.init = init;
  
    return that;
}
