SYPlayer.MainController = function() {
    var that = {},
    mainView = null,
    chatController = null,
    socket = null,
    isAdmin = false,
    stream = null,
	mainModel = null, 
	playlistView = null,
    searchView = null,
    videoView = null,
    live = false,
    

    init = function(id) {
        
		mainModel = SYPlayer.MainModel;
		mainModel.init();
		playlistView = SYPlayer.PlaylistView;
		playlistView.init();
		searchView = SYPlayer.SearchView;
		searchView.init();
        videoView = SYPlayer.VideoView;
        videoView.init();
        mainView = SYPlayer.MainView();
        mainView.init();
		setUpHandlers();
            
        socket = io.connect();
        initSockets();                
        
        if(id) { //Falls ID übergeben --> STREAM-Seite
            socket.on('connect', function() {
                socket.emit('joinStream', id);
                checkCookie(id);
                if(isAdmin) {
                    var tick = setInterval(synchCurrentTime, 1000);
                    socket.emit('setAdmin');
                }
                if(!isAdmin) {
                    disablePlaylistInteraction();
                }
            });
        }
        
        if(!id) { //Falls keine ID übergeben --> INDEX-Seite
            if($('body').hasClass('index')) {
                socket.emit('getAllStreams');
            }
        }
            
        
        chatController = SYPlayer.ChatController();
        chatController.init(socket, id); 
                
        SYPlayer.ClockView().init();      
    },
    
    disablePlaylistInteraction = function() {
        $('#playlist').sortable('disable');
    },

    initSockets = function() {
        socket.on('streamCreated', function(id) {
            window.location.replace("/"+id);
        });
        
        
        socket.on('updateStream', function(newStream) {
            stream = newStream;
            $("#zuschauer").html(stream.users + " Zuschauer");
        });
        
        socket.on('updatePlaylist', function(playlist) {
            mainModel.setPlaylist(playlist);
        });
        
        socket.on('joinedStream', function(newStream) {
            stream = newStream;
            mainModel.setPlaylist(stream.playlist);
            mainView.removeOverlay();
            if(stream.admin) {
                live = true;
                mainView.adminIsHere();
            }
            else if(!stream.admin && !isAdmin) {
                mainView.adminIsNotHere();
            }
           
        });
        
        socket.on('getSynchedTime', function(time) {
            if(!isAdmin) {
                var currentState = ytplayer.getPlayerState();
                if(currentState == 1) {
                    var currentTime = ytplayer.getCurrentTime();
                    if(currentTime > time+5 || currentTime < time-5) {
                        ytplayer.seekTo(time);                
                    }
                }
                 
            }
        });
        
        socket.on('loadCurrentVideo', function(videoID) {
            videoView.loadVideo(videoID);
        });
        
        socket.on('setNewState', function(newState) {
            var currentState = ytplayer.getPlayerState();
            if(currentState != newState) {
                if (newState == 1){
                    ytplayer.playVideo();
                }
                if (newState == 2){
                    ytplayer.pauseVideo();
                }
            }

        });
        
        socket.on('showAllStreams', function(streams) {
            mainView.showAllStreams(streams);
        });
        
        socket.on('grantAdminRights', function(id) {
            if(id) {
                $.cookie("streamid", id);
                window.location.replace("/"+id);
            }
            else {
                mainView.passwordIncorret();
            }
        })
    },
    
    setUpHandlers = function() {
		$(searchView).on("onVideoURLAdded", onVideoURLAdded);
        $(mainView).on("createStream", createStream);
		$(playlistView).on("onTitleClicked", onTitleClicked);
		$(playlistView).on("onDeleteClicked", onDeleteClicked);
		$(searchView).on("addPlaylist", addToPlaylist);
        $(mainModel).on("updatePlaylist", updatePlaylist);
        $(videoView).on("videoLoaded", synchVideoId);
        $(mainView).on("passwordEntered", checkPassword);
        $(videoView).on("stateChanged", changeState);
        $(videoView).on("youTubePlayerReady", youTubePlayerReady);
        
	}, 

    youTubePlayerReady = function() {
        if(stream.currentVideo) {
            videoView.loadVideo(stream.currentVideo);
        }
        else {
        }
    },
    
    synchVideoId = function(event, videoID) {
        if(isAdmin) {
            socket.emit("setCurrentVideo", videoID);
        }
    },

    synchCurrentTime = function() {
        var currentState = ytplayer.getPlayerState();
        var time = ytplayer.getCurrentTime();
        if(currentState == 1) {
            socket.emit('synchTime', time);
        }
    },
    
    changeState = function (event, newState){
        if(isAdmin) {
            socket.emit("newState", newState);
        }
    },
    
	onDeleteClicked = function(event, videoId) {
		mainModel.deleteVideo(videoId);
		playlistView.removeVideoFromView(videoId);
	}, 

	onTitleClicked = function(event, videoID) {
        if(isAdmin || !live) {
		    videoView.playVideo(videoID);
        }
	}, 

	onVideoURLAdded = function(event, url) {
    	var params = getParameters(url);
		var videoID = params['v'];
        var isNotInPlaylist = true;

        var playlist = mainModel.getPlaylist();
        for(var i=0; i<playlist.length; i++){            
            if(playlist[i].id==videoID){
                isNotInPlaylist = false;
                $('#alert').append("<div class='alert alert-error'><a class='close' data-dismiss='alert' href='#'>&times;</a>Das Video befindet sich bereits in der Playliste!</div>");
                break;
            }
        }
        
        if(isNotInPlaylist) {
            var title = findTitle(videoID);
            addToPlaylist(event, videoID, title);
        }
	}, 

	getParameters = function(query) {
		var searchString = query.substring(query.indexOf('?') + 1), params = searchString.split("&"), hash = {};
		for (var i = 0; i < params.length; i++) {
			var val = params[i].split("=");
			hash[unescape(val[0])] = unescape(val[1]);
		}

		return hash;
	}, 
    
    checkPassword = function(event, enteredPassword) {
        socket.emit('checkPassword', enteredPassword);
    },

	findTitle = function(videoID) {
        var videoTitle = "";
		$.ajax({
			url : 'http://gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2&alt=jsonc',
			dataType : 'json',
            async: false,
			success : function(data) {//callback Funktion falls alles in Ordnung war die requesteten Daten hast du als Parameter (data)
                var title = data.data.title;
				videoTitle = title;
			}
		});
        return videoTitle;
	},
  	
  	addToPlaylist = function(event, videoID, title) {
  		mainModel.addToPlaylist(videoID, title);
  	},
      
    loadPlaylist = function() {	
        if(stream.playlist) {
            mainModel.setPlaylist(stream.playlist);
        }
    },
    
    updatePlaylist = function() {
        socket.emit('updatePlaylist', mainModel.getPlaylist());  
    },
    
    checkCookie = function(id) {
        if(id && $.cookie("streamid") == id) {
            isAdmin = true;
        };
    },    
            
    createStream = function() {
        var title = $("#input-stream-title").val();
        var description = $("#input-stream-description").val();
        var id = $("#stream-id").val();
        var privat = $("#input-private-stream").is(":checked");
        var password = $("#input-password").val();
        socket.emit('createStream', id, title, description, privat, password);
        $.cookie("streamid", id);
    };
    
    that.init = init;
    that.socket = socket;
    that.updatePlaylist = updatePlaylist;
    that.findTitle = findTitle;
    that.onTitleClicked = onTitleClicked;

    return that;
};