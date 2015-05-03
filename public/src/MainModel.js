SYPlayer.MainModel = function() {

    var that = {}, 
    playlist = [], 
    playlistView = null,
    mainController = null,

	init = function() {
        playlistView = SYPlayer.PlaylistView;
        mainController = SYPlayer.MainController;
	}, 

	addToPlaylist = function(videoID, title) {
		playlist.push({
			id : videoID,
			name : title
		});
		savePlaylist();
        playlistView.reloadPlaylist(playlist);
        $(that).trigger('updatePlaylist');
	}, 

	deleteVideo = function(videoID) {
		playlist.splice(findPosition(videoID), 1);
        playlistView.reloadPlaylist(playlist);
        $(that).trigger('updatePlaylist');
		savePlaylist();
	
	}, 

	getPlaylist = function() {
		return playlist;
	},
    
    setPlaylist = function(newPlaylist) {
        playlist = newPlaylist;
        playlistView.reloadPlaylist(playlist);
    },

	getMaxLength = function() {
		return playlist.length;
	}, 

	findPosition = function(videoID) {
		for (var i = 0; i < playlist.length; i++) {
			if (playlist[i].id == videoID) {
				return i;
			}
		}
	},
    
    swapPlaylistItems = function(index_a, index_b) {
        var temp = playlist[index_a];
        playlist[index_a] = playlist[index_b];
        playlist[index_b] = temp;
        $(that).trigger('updatePlaylist');
    },

	savePlaylist = function() {
		$(that).trigger("save");
	};

	that.init = init;
	that.addToPlaylist = addToPlaylist;
	that.deleteVideo = deleteVideo;
	that.getPlaylist = getPlaylist;
    that.setPlaylist = setPlaylist;
	that.getMaxLength = getMaxLength;
	that.savePlaylist = savePlaylist;
    that.findPosition = findPosition;
    that.swapPlaylistItems = swapPlaylistItems;

	return that;

}();
