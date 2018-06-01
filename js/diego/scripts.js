if (typeof wTwitter !== "undefined") {
	

    /////////////MODULO TWITTER
    $(document).ready(function() {
    
        JQTWEET = {
             
            // Set twitter hash/user, number of tweets & id/class to append tweets
            // You need to clear tweet-date.txt before toggle between hash and user
            // for multiple hashtags, you can separate the hashtag with OR, eg:
            // hash: '%23jquery OR %23css'			    
            //{AVATAR}
            search: '', //leave this blank if you want to show user's tweet
            user: 'diegooreyh', //username 
            numTweets: 10, //number of tweets
            appendTo: '#jstwitter', 
            cacheExpiry: 1, //get the new cache in 2 hours
            template: '<div class="item"><a href="{URL}" target="_blank"><img id="avatar" src="https://www.diegorey.es/img/cached/diego-avatar.jpg"/></a><div class="tweet-wrapper"><span class="user">@{USER}</span><br/><span class="text">{TEXT}</span>\
                       <span class="time"><a href="{URL}" target="_blank">{AGO}</a></span></div></div>',
             //{IMG}
            // core function of jqtweet
            // https://dev.twitter.com/docs/using-search
            loadTweets: function() {
    
                var request;
                 
                // different JSON request {hash|user}
                if (JQTWEET.search) {
                request = {
                    q: JQTWEET.search,
                    count: JQTWEET.numTweets,
                    expiry: JQTWEET.cacheExpiry,	
                    api: 'search_tweets'
                }
                } else {
                request = {
                    q: JQTWEET.user,
                    count: JQTWEET.numTweets,
                    expiry: JQTWEET.cacheExpiry, 
                    api: 'statuses_userTimeline'
                }
                }
    
                $.ajax({
                    url: 'https://www.fantribes.com/ft-modules/diego/twitter/grabtweets.php',
                    type: 'POST',
                    dataType: 'json',
                    data: request,
                    success: function(data, textStatus, xhr) {
                        
                        if (data.httpstatus == 200) {
                            if (JQTWEET.search) data = data.statuses;
    
                        var text, name, img;	         
                                            
                        try {
                          // append tweets into page
                          for (var i = 0; i < JQTWEET.numTweets; i++) {		
                          
                            img = '';
                            url = 'http://twitter.com/' + data[i].user.screen_name + '/status/' + data[i].id_str;
                            try {
                              if (data[i].entities['media']) {
                                img = '<a href="' + url + '" target="_blank"><img src="' + data[i].entities['media'][0].media_url + '" /></a>';
                              }
                            } catch (e) {  
                              //no media
                            }
                          
                            $(JQTWEET.appendTo).append( JQTWEET.template.replace('{TEXT}', JQTWEET.ify.clean(data[i].text) )
                                .replace('{USER}', data[i].user.screen_name)
                                .replace('{IMG}', img)                                
                                .replace('{AGO}', JQTWEET.timeAgo(data[i].created_at) )
                                .replace('{URL}', url )
                                .replace('{AVATAR}', data[i].user.profile_image_url )				                            
                                );
                          }
                      
                      } catch (e) {
                          //item is less than item count
                      }
                      
                            if (JQTWEET.useGridalicious) {                
                                //run grid-a-licious
                                                $(JQTWEET.appendTo).gridalicious({
                                                    gutter: 13, 
                                                    width: 200, 
                                                    animate: true
                                                });	                   
                                            }                  
                            
                       } else alert('no data returned');
                     
                    }   
         
                });
         
            }, 
             
                 
            /**
              * relative time calculator FROM TWITTER
              * @param {string} twitter date string returned from Twitter API
              * @return {string} relative time like "2 minutes ago"
              */
            timeAgo: function(dateString) {
                var rightNow = new Date();
                var then = new Date(dateString);
                 
                if ($.browser.msie) {
                    // IE can't parse these crazy Ruby dates
                    then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
                }
         
                var diff = rightNow - then;
         
                var second = 1000,
                minute = second * 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7;
         
                if (isNaN(diff) || diff < 0) {
                    return ""; // return blank string if unknown
                }
         
                if (diff < second * 2) {
                    // within 2 seconds
                    return "right now";
                }
         
                if (diff < minute) {
                    return Math.floor(diff / second) + " seconds ago";
                }
         
                if (diff < minute * 2) {
                    return "about 1 minute ago";
                }
         
                if (diff < hour) {
                    return Math.floor(diff / minute) + " minutes ago";
                }
         
                if (diff < hour * 2) {
                    return "about 1 hour ago";
                }
         
                if (diff < day) {
                    return  Math.floor(diff / hour) + " hours ago";
                }
         
                if (diff > day && diff < day * 2) {
                    return "yesterday";
                }
         
                if (diff < day * 365) {
                    return Math.floor(diff / day) + " days ago";
                }
         
                else {
                    return "over a year ago";
                }
            }, // timeAgo()
             
             
            /**
              * The Twitalinkahashifyer!
              * http://www.dustindiaz.com/basement/ify.html
              * Eg:
              * ify.clean('your tweet text');
              */
            ify:  {
              link: function(tweet) {
                return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
                  var http = m2.match(/w/) ? 'http://' : '';
                  return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
                });
              },
         
              at: function(tweet) {
                return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
                  return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
                });
              },
         
              list: function(tweet) {
                return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
                  return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
                });
              },
         
              hash: function(tweet) {
                return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
                  return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
                });
              },
         
              clean: function(tweet) {
                return this.hash(this.at(this.list(this.link(tweet))));
              }
            } // ify
         
             
        };		
        
    });
    
    //LLAMADA
    $(function () {
        // start jqtweet!
        JQTWEET.loadTweets();
    });		
    
        /* jQuery - Easy Ticker - Plugin v2.0 www.aakashweb.com (c) 2014 Aakash Chakravarthy MIT License. */
        ;(function($,h,i,j){var k="easyTicker",defaults={direction:'up',easing:'swing',speed:'slow',interval:2000,height:'auto',visible:0,mousePause:1,controls:{up:'',down:'',toggle:'',playText:'Play',stopText:'Stop'}};function EasyTicker(f,g){var s=this;s.opts=$.extend({},defaults,g);s.elem=$(f);s.targ=$(f).children(':first-child');s.timer=0;s.mHover=0;s.winFocus=1;init();start();$([h,i]).off('focus.jqet').on('focus.jqet',function(){s.winFocus=1}).off('blur.jqet').on('blur.jqet',function(){s.winFocus=0});if(s.opts.mousePause==1){s.elem.mouseenter(function(){s.timerTemp=s.timer;stop()}).mouseleave(function(){if(s.timerTemp!==0)start()})}$(s.opts.controls.up).on('click',function(e){e.preventDefault();moveDir('up')});$(s.opts.controls.down).on('click',function(e){e.preventDefault();moveDir('down')});$(s.opts.controls.toggle).on('click',function(e){e.preventDefault();if(s.timer==0)start();else stop()});function init(){s.elem.children().css('margin',0).children().css('margin',0);s.elem.css({position:'relative',height:s.opts.height,overflow:'hidden'});s.targ.css({'position':'absolute','margin':0});setInterval(function(){adjHeight()},100)}function start(){s.timer=setInterval(function(){if(s.winFocus==1){move(s.opts.direction)}},s.opts.interval);$(s.opts.controls.toggle).addClass('et-run').html(s.opts.controls.stopText)}function stop(){clearInterval(s.timer);s.timer=0;$(s.opts.controls.toggle).removeClass('et-run').html(s.opts.controls.playText)}function move(a){var b,eq,appType;if(!s.elem.is(':visible'))return;if(a=='up'){b=':first-child';eq='-=';appType='appendTo'}else{b=':last-child';eq='+=';appType='prependTo'}var c=s.targ.children(b);var d=c.outerHeight();s.targ.stop(true,true).animate({'top':eq+d+"px"},s.opts.speed,s.opts.easing,function(){c.hide()[appType](s.targ).fadeIn();s.targ.css('top',0);adjHeight()})}function moveDir(a){stop();if(a=='up')move('up');else move('down')}function fullHeight(){var a=0;var b=s.elem.css('display');s.elem.css('display','block');s.targ.children().each(function(){a+=$(this).outerHeight()});s.elem.css({'display':b,'height':a})}function visHeight(a){var b=0;s.targ.children(':lt('+s.opts.visible+')').each(function(){b+=$(this).outerHeight()});if(a==1){s.elem.stop(true,true).animate({height:b},s.opts.speed)}else{s.elem.css('height',b)}}function adjHeight(){if(s.opts.height=='auto'&&s.opts.visible!=0){anim=arguments.callee.caller.name=='init'?0:1;visHeight(anim)}else if(s.opts.height=='auto'){fullHeight()}}return{up:function(){moveDir('up')},down:function(){moveDir('down')},start:start,stop:stop,options:s.opts}}$.fn[k]=function(a){return this.each(function(){if(!$.data(this,k)){$.data(this,k,new EasyTicker(this,a))}})}})(jQuery,window,document);
    $(document).ready(function(){
    var altura = $(document).height();
        
            
    
             
    $(window).bind("load", function() { 
       //setTimeout(function(){  $("a:contains('atedral')").addClass("hash");$(".text:contains('RT')").parent().parent().remove(); }, 1000); 
    
    
        var dd = $('#vticker').easyTicker({
            direction: 'down',
            speed: 'slow',
            interval: 4000,
            height: altura,
            visible: 8,
            mousePause: 0
        }).data('easyTicker');
    
    });
    });
    
    }