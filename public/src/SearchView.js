SYPlayer.SearchView = function() {
    
    var that = {},
    resultId = 0,
    mainModel = null,
	
	init = function() {
        mainModel = SYPlayer.MainModel;
        searchYouTube();
        setUpAddVideoButton();
	},
    
        
    setUpAddVideoButton = function() {
        
  		$('#add-url').submit(function() {
  			var url = $('#video-link').val();
            var matches = url.match(/http:\/\/(?:www\.)?youtube.*watch\?v=([a-zA-Z0-9\-_]+)/);
            if (matches) {
                $('#alert').empty();
                $(that).trigger("onVideoURLAdded", [url]);
            } else {
                $('#alert').empty();
                $('#alert').append("<div class='alert alert-error'><a class='close' data-dismiss='alert' href='#'>&times;</a>Bitte gib einen gültigen YouTube-Link ein.</div>");
            }
            $('#video-link').val("");
            $('#video-link').focus();
            
            return false;
  		});
  	},

    //START: direkte Suche in YouTube
	searchYouTube = function() {
			
	$("#form-search").submit(function(event) {
        $("#search-results").empty();
        $('#alert').empty();
		event.preventDefault();
				
        //Auslese der Texteingabe
		var search = $("#search").val();
                
        //Erstellen der YouTube URL
		var keyword= encodeURIComponent(search);
		var yt_url='http://gdata.youtube.com/feeds/api/videos?max-results=12&q='+keyword+'&format=1&v=2&alt=jsonc'; 

	    //Holt Daten der Lieder und erstellt die einzelnen gefundenen Videos
		$.ajax({
		    type: "GET",
			url: yt_url,
			dataType:"jsonp",
			success: function(response){		
						
                if(response.data.items){
					$.each(response.data.items, function(i,data){
                        var video_id=data.id;
						resultId++;
                        var video_title=data.title;
						var video_viewCount=data.viewCount;
//						var video_frame="<iframe src='http://www.youtube.com/embed/"+video_id+"' frameborder='0' type='text/html'></iframe>";
                        var video_image='<img src="http://img.youtube.com/vi/'+ video_id +'/mqdefault.jpg" />'
						//dem div weitere attribute geben
						//Wenn auf Button geklickt: $current.target.closer() --> selektiert dir das nächstgelegene Result
						//.attr können atrribute rausgelesen werden

						var final="<div class='result' id="+video_id+" title="+escape(video_title)+"><div>"+video_image+"<div class='video-title'><div class='video-title-content'>"+video_title+"</div></div></div><button class='btn btn-inverse addToPlaylist'>Auf die Playlist</button></div>";
                        $("#search-results").append(final);

                        for(i=0; i<mainModel.getMaxLength(); i++){
                            var playlist = mainModel.getPlaylist();
                            
                            if(playlist[i].id==video_id){
                                $("div#" + video_id + " .addToPlaylist").removeClass("btn btn-inverse");
                                $('div#' + video_id + ' .addToPlaylist').addClass("btn btn-danger").html("Bereits hinzugef&uuml;gt!").attr("disabled","disabled");
                            }
                        }
                    });
                    
					var plB = $('.addToPlaylist');
					plB.click(function(event) {
                        var $playlistBtn = $(event.currentTarget);
                        var ergebnis = $playlistBtn.closest('.result');
                        var videoID = ergebnis.attr("id");
                        var videoTitle = unescape(ergebnis.attr("title"));
					
						$(that).trigger("addPlaylist", [videoID, videoTitle]);
                            event.preventDefault();
                            $(event.currentTarget).html("Hinzugef&uuml;gt!").attr("disabled","disabled");
                            $(event.currentTarget).removeClass("btn btn-inverse");
                            $(event.currentTarget).addClass("btn btn-success");
					});
                    
                    $('#search-scrollbar').css("visibility", "visible");
                    $('#search-page-controls').css("visibility", "visible");
                    $('#result-slider').sly({
                        horizontal: 1,
                        scrollBar: "#search-scrollbar",
                        pagesBar: ".search-pages",
                        pageBuilder:
                        function (index) {
                            return '<li>' + (index + 1) + '</li>';
                        },
                        prevPage: ".search-prev-page", 
                        nextPage: ".search-next-page", 
                    	itemNav: "smart",
                    	dragHandle: 9,
                    	dynamicHandle: 1,
                    	dragging: 1,
                    	scrollBy: 1,
                    	speed: 300
                    });
				}
                    
				else{
				    $("#search-results").append("No Video Found!");
				}
			}
		});
    });
	};

	that.init = init;
	return that;

}();
