SYPlayer.PlaylistView = function() {
    
    var that = {}, 
    playlistDiv = null,
    mainModel= null,
    
    init = function() {
        mainModel = SYPlayer.MainModel;
		playlistDiv = $('#playlist');
        playlistDiv.on('click', 'li', onPlaylistClick);
        playlistDiv.on('click', 'li .delete', onDeleteClick);
        playlistDiv.sortable({
            start: function (event, ui) {
                $(ui.item).data("startindex", ui.item.index());
            },
            stop: function (event, ui) {
                setSwappedPlaylistItems(ui.item);
            },
            update: function( event, ui ) {},
            refreshPositions: true,
            helper: 'clone'
        });

        $('#playlist').slimScroll({
            position: 'left',
            color: '#FFF',
            size: '5px',
            height: 700,
            alwaysVisible: false
        });

//        $('#playlist-slider').sly({
//            itemNav: "smart",
//        	dragHandle: 1,
//        	dynamicHandle: 1,
//        	dragging: 1,
//        	speed: 300,
//        	startAt: 10,
//        	scrollBy: 1,
//        	elasticBounds: 1
//        });
    
	},
    
    setSwappedPlaylistItems = function($item) {
        var startIndex = $item.data("startindex") ;
        var newIndex = $item.index();
        if (newIndex != startIndex) {
            mainModel.swapPlaylistItems(startIndex, newIndex);
        }
    },
    
    reloadPlaylist = function(playlist) {
        playlistDiv.empty();
        $.each(playlist, function(index, video) {
            var videoID = video.id;
            var title = video.name;
            var tpl = getTemplate("playlist-tpl",{
                videoID: videoID,
                videoTitle: title
            });
            
            playlistDiv.append(tpl);
            $('.leeresDiv').remove();
            playlistDiv.append("<div class='leeresDiv'></div>");
            
        });
    },
    
    onPlaylistClick = function(event) {
        if($(event.target).attr('class') != 'delete') {
            var clickedVideo = $(event.currentTarget);
            var videoID = clickedVideo.attr('id');
            $(that).trigger("onTitleClicked", [videoID]);   
        }
    },   
    
    onDeleteClick = function(event) {
        var clickedVideo = $(event.currentTarget).parent();
        var videoID = clickedVideo.attr('id');
        $(that).trigger("onDeleteClicked", [videoID]);
    },
    
    getTemplate = function(id, options) {
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };
        
        var tpl = $("#" + id).html();
        var compiled = _.template(tpl);
        return compiled(options);
    },
	
	removeVideoFromView = function(videoId) {
		$("ul#playlist #" + videoId).fadeOut(300, function(){this.remove() });
	};
	
	that.init = init;
	that.removeVideoFromView = removeVideoFromView;
    that.reloadPlaylist = reloadPlaylist;
	
	return that;

}();
