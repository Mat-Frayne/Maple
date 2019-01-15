var socket, timeout;
var socket = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws');

function send(data){
    try{out = JSON.stringify(data)}
    catch{out = data}
    socket.send(out)
}
$(function () {
    
    socket.onopen = () => {
        send(
            {
                "test":{ "data": 20009},
                "test1":576,
                "test3": 1
            }
        )
        socket.onmessage = (e) =>{
            console.log(e.data)
        }

}})



function ack(response) {
    if (response.hasOwnProperty('err'))
        return
    //alert error

    response.items.forEach(x => {
        $("#searchresults").append("<div class=''>" + x.snippet.title + "</div>")
    })
    $("#searchresults").fadeIn();
}
$(document).on("keyup", "#search input", function () {
    var that = this;
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(function () {
        socket.send('search', {
            q: $(that).val()
        }, callback = ack);
    }, 1000);
})

$(document).on('click', function (e) {
    if ($(e.target).closest('.searchmy').length < 1 &&
        $(e.target).closest('.searchbutt').length < 1)

        $(".searchmy").fadeOut();
    else {
        $(".searchmy").fadeIn();
        $(".searchmy input").focus();
    }
    link = $(e.target).attr("data-href")
    if (link) {
        csslink = "/static/css/" + link + ".css?v=" + Math.random()
        htmllink = "/static/html/" + link + ".html?v=" + Math.random()

        if ($("link[data-link$='" + link + "']").length < 1)
            $('head').append($('<link rel="stylesheet" data-link="' + link + '" type="text/css" />').attr('href', csslink));
        $("#content").load(htmllink);
    }
});
$(document).keyup(function (e) {
    if (e.which == 27) $(".searchmy").fadeOut();
});