SYPlayer.VideoView = function() {

	var that = {},
    mainController = null,
    mainModel = null,
    playlist = [],
	i = 0,
    
	init = function() {
        mainController = SYPlayer.MainController;
        mainModel = SYPlayer.MainModel;
        setupPlayer();
        $(window).on("playerReady", onYouTubePlayerReady);
        clickNextButton();
	},
    
    setupPlayer = function() {
        var videoID = "QH2-TGUlwu4";
        var params = { allowScriptAccess: "always", allowFullScreen: 'true' };
        var atts = { id: "ytplayer" };
        swfobject.embedSWF("https://www.youtube.com/v/" + videoID + "?enablejsapi=1&playerapiid=ytplayer&version=3&controls=1&autohide=1", "ytplayer", "540", "329", "8", null, null, params, atts); 
       
    },

	playVideo = function(videoID) {
		i = mainModel.findPosition(videoID);
        loadVideo(videoID);
	},
    
    playPlaylist = function() {
        playlist = mainModel.getPlaylist();
        
        if(document.getElementById('nacheinander').checked) {
		    if(i<=playlist.length-2){
		        playNextVideo();
		    } else {
		        i=0;
                loadVideo(playlist[i].id);
		    }
		} else if(document.getElementById('zufaellig').checked) {
			playRandomVideo();
		}
    },
    
    playNextVideo = function() {
        i++;
        loadVideo(playlist[i].id); 
    },
    
	playRandomVideo = function(){
	 	i = _.random(0, playlist.length-1); 
	 	loadVideo(playlist[i].id);
	},
     
    clickNextButton = function() {
        $("#next").click(function() {
            playPlaylist();    
        });
    },
    
	loadVideo = function(videoID) {
        $('#ytplayer').show();
        i = mainModel.findPosition(videoID);
        ytplayer.loadVideoById(videoID);
        var playlist = mainModel.getPlaylist();
        var video = playlist[mainModel.findPosition(videoID)];
        var title = video.name;
        $("#current-video-title").html("<h4>"+title+"</h4>");
        $("#playlist .active").removeClass('active');
        $("#playlist").scrollTo( 'li#'+videoID+'', 700);
        $('#playlist li#'+videoID+'').addClass('active');
        $(that).trigger("videoLoaded", [videoID]);
//        var top = $('li#'+videoID+'').offset().top;
//        var topHeigthSong = top - 291;
//        $("#playlist").slimScroll({ scrollTo: topHeigthSong});
//        $("#playlist").slimScroll({scrollBy: 'li#'+videoID+''});
	},

	onytplayerStateChange = function(newState) {
    	if(newState == 1 || newState == 2) {
            $(that).trigger("stateChanged", newState);
    	} else if(newState == 0) {
        	playPlaylist();
    	}
	},
    
    onytplayerError = function(error) {
        if(error == 101 || error == 2 || error == 150) {
            $('#playlist .active').css('background', 'red');
            playPlaylist();
        }
    },
    
    onYouTubePlayerReady = function() {
        ytplayer = document.getElementById("ytplayer");
        ytplayer.addEventListener("onStateChange", "SYPlayer.VideoView.onytplayerStateChange");
        ytplayer.addEventListener("onError", "SYPlayer.VideoView.onytplayerError");
        $(that).trigger('youTubePlayerReady');
    },
    
    hidePlayer = function() {
        $('#ytplayer').hide();
    };
	
	that.init = init;
    that.playVideo = playVideo;
    that.loadVideo = loadVideo;
    that.onytplayerStateChange = onytplayerStateChange;
    that.onytplayerError = onytplayerError;
    that.setupPlayer = setupPlayer;
    that.hidePlayer = hidePlayer;
	
	return that;
}();

