var player;

function padtime(in_){
    var mins1 = ("0" + Math.floor(in_ / 60)).slice(-2)
    var secs1 =  ("0" + Math.floor(in_ % 60)).slice(-2)
    return mins1 + ":" + secs1
}
$(function () {
    socket ? registerevents() : () => {
        throw new Error("FATAL: Socket not loaded.")
    }
    player = new Player();
})


function registerevents() {
    player = document.player
    socket.emit("conndata", function (data){
        console.log(data)
        if (data.data) 
        player.setdata(data.data)

    })

    socket.on("playplayer", function (data) {
        player.setdata(data.playing)
        player.current = data.playing;
        if(data.device == socket.id && data.from != socket.id){
           player.playpause(data.playing.url)
        }
    })
    socket.on("playerpause", function (data){
        console.log(data)
        if(data.device == socket.id){
            player.playpause();
            console.log("dsafasd")
        //$(".playpause").text("⯇")  
        }

    })
    // socket.on("playerpause", function (data){
    //     if(data.device = socket.id)
    //         player.audio.play();
    //     $(".playpause").text("❚❚")  

    // })

    socket.on("playerupdate", function (data) {
        if(data.device == socket.id)return
        $(".playertime").text(data.data.time.start  + " / " + data.data.time.end)
        $(".backgroundperc").css({width: data.data.perc})
        switch(data.data.status){
            case 0: // stopped
                break;
            case 1: //paused
                $(".playpause").text("⯇")    
                break;
            case 2: // playing
                $(".playpause").text("❚❚")  
                break;
            
        }

    });
}


const Player = class {
    constructor() {
        this.song = null;
        this.queue = [];
        this.current = null;
        this.audio = new Audio();
        this.audio.load();

        this.last = 0;
        this.cons();
        this.audio.addEventListener("timeupdate", function (){
            var start = padtime(player.audio.currentTime)
            var end = padtime(player.current.duration)
            $(".playertime").text(start  + " / " + end)
            $(".backgroundperc").css({width: (player.audio.currentTime / player.current.duration) * 100 + "%"})
            socket.emit("playerupdate", 
            {
                time: {"start": start, "end": end},
                perc:  (player.audio.currentTime / player.current.duration) * 100 + "%",
                url: player.audio.src,
                status: 2
            })

        })
        this.audio.addEventListener("ended", function (){
            $(".playpause").text("⯇")    
        });
        this.audio.addEventListener("pause", function (){
            //socket.emit("playerpause")
            socket.emit("playerupdate", 
            {
                time: {"start": player.current.currentTime, "end": player.current.duration},
                perc:  (player.audio.currentTime / player.current.duration) * 100 + "%",
                url: player.audio.src,
                status: 1,
            })
        });
        this.audio.addEventListener("play", function (){
            socket.emit("playerplay", fromsock=true)
            $(".playpause").text("❚❚")    
        });
        
    }
}
// player.audio.onplay = function(){
//     console.log("Playing")
// }
Player.prototype.prev = function () {
    console.log("prev")
}
Player.prototype.play = function(source = null){
 

}
Player.prototype.next = function () {
    console.log("next")

}

Player.prototype.playpause = function (source = null, fromsock = false) {
    if(fromsock) return

    if(!source || (player.audio.src == source)){
        if(!player.audio.src)
            socket.emit("playerpause")
        else
        player.audio.paused ? player.audio.play() : player.audio.pause()}
    else {
        player.audio.setAttribute('src', source); //change the source
        player.audio.load();
        player.audio.play()
    }
}
Player.prototype.setdata = function (data) {
    var newviews;
    views = parseInt(data.view_count)
    if (views > 1000000) newviews = Math.floor(views / 1000000) + "m"
    else if (views > 1000) newviews = Math.floor(views / 1000) + "k"
    this.p.find(".playertitle").html((data.track || data.title) + "<br>" + (data.artist || data.uploader) + " &#8226; " + (newviews || views) + " views")
    this.p.find(".playericon").css("background-image", "url('" + data.thumbnail + "')")
    mins = Math.floor(data.duration / 60)
    secs = data.duration % 60
    this.p.find(".playertime").text("0.00 / " + mins + "."+ secs)
}
Player.prototype.cons = function () {
    this.p = $("<div/>", {
        id: "MaplePlayer",
        css: {
            width: "100%",
            height: "70px",
            background: $("body").css('background-color'),
            "z-index": 999998,
            left: 0,
            bottom: 0,
            position: "fixed"
        }
    })
    buttons = $("<div/>", {
        class: "playerbuttons",
        css: {
            position: "relative",
            float: "Left",
            height: "100%",
        }
    }).appendTo(this.p);
    button = function (class_, text_, click) {
        $("<div/>", {
            class: class_,
            text: text_,
            css: {
                width: "45px",
                height: "45px",
                "line-height": "45px",
                "text-align": "center",
                color: "white",
                "font-size": "30px",
                cursor: "pointer",
                "border-radius": "50%",
                "margin-top": "12.5px",
                "margin-left": "20px",
                "float": "left",
                "transition-duration": "150ms"
            },
            mouseenter: () => {
                $("." + class_).css('background', '#333333')
            },
            mouseout: function () {
                $("." + class_).css('background', 'transparent')
            },
            click: function () {
                click()
            }
        }).appendTo(buttons)
    }
    button("prevplayer", "⭰", this.prev)
    button("playpause", "⯇", this.playpause)
    button("playernext", "⭲", this.next)
    $("<div/>", {
        class: "playertime",
        text: "2.58 / 3.00",
        css: {
            position: "relative",
            float: "Left",
            width: "110px",
            height: "100%",
            "line-height": $(this.p).height() + "px",
            "text-align": "center",
            "margin-left": "20px",
            "color": "#bbb9b9"
        }
    }).appendTo(this.p)
    playerinfocontainer = $("<div/>", {
        class: "playerinfocontainer",
        css: {
            position: "relative",
            display: "flex",
            float: "Left",
            width: "calc(100% - 535px)",
            height: "100%",
            "text-align": "center",
            "margin-left": "20px",
            "color": "#bbb9b9",
            "justify-content": "center",
            "flex-wrap": "wrap",
        }
    }).appendTo(this.p)
    $("<div/>", {
        class: "playericon",
        css: {
            position: "relative",
            float: "Left",
            width: "30px",
            height: "30px",
            "margin-top": "20px",
            background: "url('/static/images/source.gif') center no-repeat",
            "background-size": "cover",
            "text-align": "center",
            "margin-left": "20px",
            "color": "#bbb9b9"
        }
    }).appendTo(playerinfocontainer)
    $("<div/>", {
        class: "playertitle",
        html: "Rise (feat. Jack & Jack & Jack) <br/> Jonas Blue, Jack & Jack & Jack • Blue • 2018",

        css: {
            float: "Left",
            height: "30px",
            "margin-top": "12.5px",
            "text-align": "left",
            "margin-left": "20px",
            "color": "#bbb9b9"
        }
    }).appendTo(playerinfocontainer)
    playperc = $("<div/>", {
        class: "playperc",
        css: {
            position: "fixed",
            width: "100%",
            height: "1px",
            bottom: "67px",
            display: "inline-block",
            left: '0px',
            cursor:"pointer",
            "z-index": 999999,
            background:"black",
            
        },
        
    }).appendTo("body")
    $("head").append("<style>.playperc:after {content:''; position:absolute;top:-5px; bottom:-5px; left:-5px; right:-5px; }</style>")
    $("<div/>", {
        class: "backgroundperc",
        css: {
            width: "10%",
            height: "2px",
            background: "aqua",
            top: "0px",
            left: '0px'
        }
    }).appendTo(playperc)

    
    $("body").append(this.p)
}

$(document).on("click", ".result .play", function () {
    id_ = $(this).closest('.result').attr("data-id")
    socket.emit("play", {
        "id": id_
    })
})

function addcallback(data){
    
}

$(document).on("click", ".addrem", function () {
    idd = $(this).closest(".result").attr("data-id")
    socket.emit("save", {id:idd}, callback = addcallback)   
});