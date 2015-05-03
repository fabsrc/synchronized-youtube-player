SYPlayer.ChatController = function() {
    var that = {},
    socket = null,
    username = null,

    init = function(mainSocket, id) {
        socket = mainSocket;
        
        socket.on('connect', function() {
            $("#chat").html('<div id="conversation"></div>');
            $("#chatcontrol").empty();
            $("#chatcontrol").append('<input id="data" class="input-large" type="text" placeholder="Benutzernamen eingeben" />');
            $("#chatcontrol").append('<input type="button" class="btn" id="datasend" value="OK" />');
                        
            if(!username){
                $('#datasend').click(setUser);
            }
            
            $('#data').keypress(function(e) {
             if(e.which == 13) {
               $(this).blur();
               $('#datasend').focus().click();
             }
            });
        
        })
        
        socket.on('updatechat', function (username, data) {
            $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
            $('#chat').animate({scrollTop: $('#conversation').height()}, 50);
            $('#chat').emoticonize({
        	 delay: 800,
             animate: false,
             exclude: 'pre, code, .no-emoticons'
      });
        });
        
       
    
    
          
    },
    
    setUser = function(){
        username = $('#data').val();
        if (username){
            socket.emit('setuser', username);
            $("#datasend").val("Senden");
            $("#data").attr({placeholder: "Nachricht..."});
            $("#data").focus();
            $("#data").val("");
            $("#datasend").unbind("click", setUser);
            $('#datasend').click(sendMessage);
        }
    },
    
    sendMessage = function() {
        var message = $('#data').val();
        if(message){
            socket.emit('sendchat', message);
            $('#data').val('');
            $('#data').focus();
        }
    };
    
    that.sendMessage = sendMessage;
    that.init = init;
    that.setUser = setUser;
  
  return that;
}