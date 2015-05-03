SYPlayer.MainView = function() {
    
    var that = {},

	init = function() {
        showStreamUrl();
        $('#facebook').click(facebookClick);
        $('#twitter').click(twitterClick);
        $('#googleplus').click(googleplusClick);
        
        $('[data-toggle="tooltip"]').tooltip();


        $("#stream-form").on('submit', function() {
            $(that).trigger("createStream");
            $('#new-stream').modal('hide');
            return false;
        });

        if ($('body').hasClass('client')) {
            initPasswordPopover();
        }
        
        if (!$('body').hasClass('index')) {
            setLoadingState();
        }
                
	},
    
    setLoadingState = function() {
        var overlay = "<div class='overlay'></div>";
        $("body").append(overlay);
    },
    
    removeOverlay = function() {
        $(".overlay").fadeOut('200');   
        $(that).trigger("bodyLoad");
    },
    
    initPasswordPopover = function() {
            var passwordForm = '<div class="input-append"><form id="password-form"><div class="control-group"><input class="input-medium" id="enter-password" type="password" placeholder="Passwort eingeben..."><button class="btn" type="submit">OK</button></div></form></div>';
            $('#admin-password').popover({html: true, placement: 'left', title: 'Passwort eingeben', content: passwordForm});
            $('#admin-password').click(function() {
                $('#password-form').submit(function() {
                var enteredPassword = $('#enter-password').val();
                $(that).trigger('passwordEntered', [enteredPassword]);
                return false;
                }) ;
            });
    },
        
    passwordIncorret = function() {
        $('#enter-password').val('').focus('').attr('Placeholder', 'Passwort falsch!');
        $('#password-form .control-group').addClass('error');
    },
    
    reloadStreamlist = function(streamlist) {
        $('#all-streams').empty();
        $.each(streamlist, function(index, video) {
            var videoID = video.id;
            var title = video.name;
            var tpl = getTemplate("streamlist-tpl",{
                videoID: videoID,
                videoTitle: title
            });
            $('#all-streams').append(tpl);
            
        });
    },
        
    showAllStreams = function(streams) {
        var allStreams = $("ul#all-streams");
        if(!jQuery.isEmptyObject(streams)) {
            allStreams.empty();
            $.each(streams, function(id, stream) {
                var streamID,videoID,streamTitle,description,zuschauer,privat;
                
                $.each(stream, function(key, value) {
                streamID = id;
                videoID = stream.currentVideo;
                streamTitle = stream.title;
                description = stream.description;
                zuschauer = stream.users;
                privat = privat;
                }); 
                var tpl = getTemplate("streamlist-tpl",{
                    streamID: streamID,
                    videoID: videoID,
                    streamTitle: streamTitle,
                    description: description,
                    zuschauer: zuschauer, 
                });
                if(!stream.privat) {
                    allStreams.append(tpl);
                }
            });
        }
        else {
            allStreams.append("<h5>Zur Zeit sind keine Streams verfügbar. Erstelle jetzt deinen eigenen Stream.</h5>");
        }
        
    },
    
    getTemplate = function(id, options) {
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };
        
        var tpl = $("#" + id).html();
        var compiled = _.template(tpl);
        return compiled(options);
    },
    
    showStreamUrl = function() {
        $('#stream-url').html(document.URL);
    },
    
    adminIsHere = function() {
        $('.adminHere').show();
        $('#tooltipShow').tooltip('show')
        
    },
    
    adminIsNotHere = function() {
        $("#container").prepend('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Nicht Live!</strong> Der Stream-Broadcaster ist zur Zeit nicht online. Die Playlist kann beliebig abgespielt werden.</div>');
    },
    
    facebookClick = function() {
        window.open('http://www.facebook.com/sharer.php?u=' + document.URL,'facebookshare','width=550,height=400,left='+(screen.availWidth/2-225)+',top='+(screen.availHeight/2-150)+'');
        return false;  
    },
    
    twitterClick = function() {
        window.open('https://twitter.com/share?url=' + document.URL,'twittershare','width=550,height=400,left='+(screen.availWidth/2-225)+',top='+(screen.availHeight/2-150)+'');
        return false;  
    },
    
    googleplusClick = function() {
        window.open('https://plus.google.com/share?url=' + document.URL,'googleplusshare','width=550,height=400,left='+(screen.availWidth/2-225)+',top='+(screen.availHeight/2-150)+'');
        return false;  
    };
    
    
	that.init = init;
    that.removeOverlay = removeOverlay;
    that.initPasswordPopover = initPasswordPopover;
    that.passwordIncorret = passwordIncorret;
    that.showAllStreams = showAllStreams;
    that.adminIsHere = adminIsHere;
    that.adminIsNotHere = adminIsNotHere;

	return that;
};