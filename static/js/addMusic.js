var index = 0,
    waiting = false;

$(document).ready(function () {
    $(".addsearch input").focus();
    if(getCookie("isviewschecked"))
        $("#slide-switch-1").prop("checked", true)
    $(".addsearch").keyup(function (e) {
        if (e.which == 13) {
            if(!$(".addsearch input").val()) return
            index = 0;
            $("#searchResults").fadeOut(function () {
                $("#searchResults").empty();
            })
            $("#searchResults").fadeIn();
            $(".loading-container").fadeIn();

            socket.emit("search", {
                q: $(".addsearch input").val(),
                token: index,
                byviews: $(".byviews input").is(':checked') ? true : false
            }, callback = cb)
        }
    });
    //debugging only
    socket.emit("search", {
        q: "alan walker",
        token: 0,
        byviews: $(".byviews input").is(':checked') ? true : false
    }, callback = cb)
});

$(window).scroll(function () {
    if (waiting) return
    if(!$(".addsearch input").val()) return

    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        $(".loading-container").fadeIn();
        $("html, body").animate({
            scrollTop: $(document).height()
        }, 1000);
        waiting = true
        console.log("asdfasd")

        socket.emit("search", {
            q: $(".addsearch input").val(),
            token: index,
            byviews: $(".byviews input").is(':checked') ? true : false
        }, callback = cb)
        
    }
});



function cb(response) {
    console.log(response)
    index = response["nextPageToken"] || 0
    $(".loading-container").fadeOut();
    for(i in response.items){
        
        x = response.items[i]
        result = $("<div/>", {
            class: "result",
            
        }).attr("data-id", i)
        artwork = $("<div/>", {
            class: "artwork"
        }).appendTo(result)
        buttons = $("<div/>", {
            class: "optbuttons"
        }).appendTo(result)

        infocontainer = $("<div/>", {
            class: "infocontainer"
        }).appendTo(result)

        views = parseInt( x.views.replace(/,/g, ""))
        newviews = views
        if(views > 1000000) newviews = Math.round(views/100000, 2)/10 + "m"
        else if(views > 1000) newviews = Math.round(views/100)/10 + "k"

        $("<div/>", {
            class:"stats",
            text:  newviews + " views "// | " +likes + " Likes | " +dislikes+ " Dislikes"
        }).appendTo(infocontainer)
        $("<div/>", {
            class: "title",
            text: x.title
        }).appendTo(infocontainer)
        $("<div/>", {
            class: "source",
            text: x.source
        }).appendTo(infocontainer)

        $("<div/>", {
            class: "play",
            text: "▶",

        }).appendTo(buttons)
        $("<div/>", {
            class: "addrem",
            text: "➕",
            click: function (){
                return
            }
        }).appendTo(buttons)



        $(artwork).css("background-image", "url('" + x.bg + "')")
        $("#searchResults").append(result)
        waiting = false;
    }



}


$("#slide-switch-1").change(function() {
    if(this.checked) 
        setCookie("isviewschecked", "1", 365)
    else
        setCookie("isviewschecked", "")

});


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
