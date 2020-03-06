function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}

let author = ""
init_status(r => {
    if (r.status == false) {
        chrome.browserAction.setPopup({
            "popup": "./popup/login.html"
        }, function() {
            window.location.href = "login.html";
        })
    } else {
        author = r.config.acn
        r.config.task_list.forEach(item => {
            $('#todo').prepend("<li>" + item + "</li>");
        });
    }
})

$('#g_and_y').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/popup.html"
    }, function() {
        window.location.href = "popup.html";
    })
})

$('#fblink').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/fbpage.html"
    }, function() {
        window.location.href = "fbpage.html";
    })
})