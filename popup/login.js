// 'http://' + domain + '/Site_Prog/API/plugin_api.php?mode=login&acn=' + act + '&pwd=' + pwd
function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}

init_status(r => {
    if (r.status) {
        chrome.runtime.sendMessage({
            type: 'update',
            info: r.config
        }, rsp => {
            console.log(rsp)
            chrome.browserAction.setPopup({ //設定popup頁面
                "popup": "./popup/popup.html"
            }, function() {
                window.location.href = "popup.html";
            })
        })
    } else {
        console.log(r.msg)
    }
})

$('#login').on('click', function() {
    let data = {}
    data.domain = $('#dmn')[0].value
    data.act = $('#account')[0].value
    data.pwd = $('#pwd')[0].value
    $.post("http://127.0.0.1:3000/login", data, r => {
        if (r.status) {
            chrome.runtime.sendMessage({
                type: 'user_info',
                info: r.info
            }, rsp => {
                console.log(rsp)
                chrome.browserAction.setPopup({ //設定popup頁面
                    "popup": "./popup/popup.html"
                }, function() {
                    window.location.href = "popup.html";
                })
            })
        } else {
            console.log(r.msg)
        }
    })

})