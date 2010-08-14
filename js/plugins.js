
// remap jQuery to $
(function($){
    var main_ul = $("#main ul"),
        slide_threshold = 20,
        slide_happening = false,
        slide_direction,
        startX,
        startY,
        currentImage,
        dontHide = false,
        util = {
            fetchFullImage: function(position, elem){
                var img_data = DEMO_DATA.feed.entry[position],
                    target = (elem) ? elem : $("#main ul li:eq("+ position +") img.thumb");
                    
                return (target.parent("li").children("img.full").length > 0) ? 
                    target.parent("li").children("img.full") : 
                    target.parent("li").append(
                        $("<img />", { 
                            src:img_data["media$group"]["media$content"][0]["url"],
                            "class":"full" 
                        }).data("imageID",position)
                    ).children("img.full");
            },
            infoBitString: function(img_info){
                var template = "<div class='infoBit hidden'><h3>" + img_info["title"]["$t"] + "</h3><div class='desc'>"+
                        "<p> credit:" + img_info["media$group"]["media$credit"][0]["$t"] + "</p>" +
                        "<p> lat,long:" + img_info["georss$where"]["gml$Point"]["gml$pos"]["$t"]+ "</p>" +
                        "<p> keywords:" + img_info["media$group"]["media$keywords"]["$t"]+ "</p>" +
                        "</div></div>";
                        
                return template;
                
            }
        };
 



    
    $.each(DEMO_DATA.feed.entry, function(i, data){
        main_ul.append(
            $("<li/>").append(
                $("<img />", { src:data["media$group"]["media$thumbnail"][0]["url"],"class":"thumb" } ).data("imageID", i)
            )
        );
    });
    

    $("ul.full li").live("mouseup touchend",function(event){
        if(dontHide){dontHide = false;return true;}
        
        $(".bottom_nav").toggleClass("hidden");
        
        return true;
    });
    



    $("ul.full li.active").live("touchstart touchmove touchend mousedown mouseup slideLeft slideRight", function(event){
        var type = event.type,
            self  = $(event.currentTarget),
            img   = self.children("img.full").first(),
            position = img.data("imageID");

        switch(type){
            case "touchstart":
                startX = event.originalEvent.touches[0].pageX;
                startY = event.clientY;

                $("ul.slideShow li").die("mousedown");
                self.bind("touchmove",function(event){
                    var currentX = event.originalEvent.touches[0].pageX,
                        diffX = startX - currentX;
                    
                        if(Math.abs(diffX) >= slide_threshold){
                            if(diffX < 0){
                                self.trigger("slideRight");
                            } else {
                                self.trigger("slideLeft");
                            }
                        }
                });
                break;
            case "mousedown":
                startX = event.clientX;
                startY = event.clientY;
                self.bind("mousemove",function(event){
                    var currentX = event.clientX,
                        currentY = event.clientY,
                        diffX = startX - currentX,
                        diffY = startY - currentY,
                        container = $("#main ul");
                        
                    if(Math.abs(diffX) >= slide_threshold){
                        if(diffX < 0){
                            self.trigger("slideRight");
                        } else {
                            self.trigger("slideLeft");
                        }
                    }
                    
                });
                return false;
                break;
            case "touchend":
                $("ul.slideShow li").die("mouseup");
                self.unbind("touchmove");
                break;
            case "mouseup":
                self.unbind("mousemove");
                return false;
                break;
            case "slideRight":
                self.unbind("mousemove");
                dontHide = true;
                if((position - 1) >= 0){
                    $("ul.slideShow li img.thumb:eq(" + (position - 1) + ")").trigger("click");
                    img.css("zIndex",0);
                }
                break;
                
            case "slideLeft":
                self.unbind("mousemove");
                dontHide = true;
                
                $("ul.slideShow li img.thumb:eq(" + (position + 1) + ")").trigger("click");
                img.css("zIndex",0);
                break;
            default:
            
        }
        return false;
    });
    
    $(".prev").bind("click",function(){dontHide = true;currentImage.trigger("slideRight");});
    $(".next").bind("click",function(){dontHide = true;currentImage.trigger("slideLeft");});
    $(".back").bind("click",function(){
        $(".bottom_nav").toggleClass("hidden");
        main_ul.removeClass("full").addClass("thumb");  
        if(window["localStorage"]){
            localStorage["fullscreen"] = 0;
        }      
    });
    
    $(".info").bind("click",function(){
        var img_info = DEMO_DATA.feed.entry[currentImage.data("imageID")],
            infoCard = (currentImage.parent("li").children(".infoBit").length > 0) ?
                currentImage.parent("li").children(".infoBit") :
                currentImage.parent("li").prepend(
                    $(util.infoBitString(img_info))
                ).children(".infoBit");
        if(infoCard.is(":visible")){
            infoCard.addClass("hidden");
        } else {
            infoCard.removeClass("hidden");
        }
        return false;
    });
    $("body").live("click",function(){
        $(".infoBit").addClass("hidden");
    });
    $("ul.slideShow li img").live("click", function(event){
        var target = $(event.target),
            position = target.data("imageID"),
            img_data = (DEMO_DATA.feed.entry[position]) ? DEMO_DATA.feed.entry[position] : false,
            thumbImage = (target.parent("li").children("img.thumb").length > 0) ? 
                target.parent("li").children("img.thumb") : 
                target.parent("li").append(
                    $("<img />", { 
                        src:img_data["media$group"]["media$thumbnail"][0]["url"],
                        "class":"thumb" 
                    }).data("imageID",position)
                ),
            fullImage = util.fetchFullImage(position);
        if(!img_data){
            return;
        }
        if(window["localStorage"]){
            localStorage["position"] = position;
            localStorage["fullscreen"] = 1;
        }
        if(target.hasClass("thumb")){
            main_ul.removeClass("thumb").addClass("full");
            $(".bottom_nav").removeClass("hidden");
            if(currentImage){
                currentImage.removeClass("active").parent("li").removeClass("active");
            }
            fullImage.css({
                position:"relative",
                zIndex:"4",
            }).addClass("active").parent("li").addClass("active");
            currentImage = fullImage;
            //Prefetch next, and previous images.
            util.fetchFullImage(position + 1);
            if(position != 0){
                util.fetchFullImage(position - 1);
            }
            
        }
    });
 

    if(window["localStorage"]){
        var position = localStorage["position"],
            fullscreen = localStorage["fullscreen"];
            
        
        if(fullscreen == 1){
            $("ul.slideShow li img.thumb:eq(" + position + ")").trigger("click");
        }
    }

})(window.jQuery);



// usage: log('inside coolFunc',this,arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};


