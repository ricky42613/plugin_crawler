function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}

function handlefile() {
    return new Promise(function(resolve, reject) {
        if ($("#list_file")[0].files.length) {
            var resultFile = document.getElementById("list_file").files[0];
            if (resultFile) {
                var reader = new FileReader();
                reader.readAsText(resultFile, 'UTF-8');
                reader.onload = function(e) {
                    var urlData = this.result;
                    let arr = urlData.split("\n").map((elem, idx) => {
                        if (elem[elem.length - 1] == '\n') {
                            return elem.slice(0, -1)
                        } else {
                            return elem
                        }
                    })
                    resolve(arr)
                        // chrome.runtime.sendMessage({
                        //     type: 'add_idlist',
                        //     target: arr
                        // }, function(response) {
                        //     arr.forEach(item => {
                        //         $('#todo').prepend("<li>" + item + " <a href='#' aria-hidden='true'>&times;</a></li>");
                        //     })
                        // })
                };
            } else {
                resolve([])
            }
        } else {
            resolve([])
        }
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
        r.config.fb_list.forEach(element => {
            $('#todo').prepend("<li>" + element + " <a href='#' aria-hidden='true'>&times;</a></li>");
        });
    }
})

// chrome.runtime.sendMessage({ //取得連結列表
//     type: 'idlist',
// }, function(response) {
//     console.log(response)
//     $('#page_link')[0].value = response.link
//     response.list.forEach(element => {
//         $('#todo').prepend("<li>" + element + " <a href='#' aria-hidden='true'>&times;</a></li>");
//     });

// });

$('#add').click(async function() { //新增標籤
    let target_list = []
    if ($("input[name=task]").val().length) {
        target_list.push($("input[name=task]").val())
            // chrome.runtime.sendMessage({
            //     type: 'add_id',
            //     target: $("input[name=task]").val()
            // }, function(response) {
            //     $('#todo').prepend("<li>" + $("input[name=task]").val() + " <a href='#' aria-hidden='true'>&times;</a></li>");
            // });
    }
    let arr_in_file = await handlefile()
    target_list.concat(arr_in_file)
    let data = {}
    data.list = target_list
    $.post('http://127.0.0.1:3000/fb/add_fblist', data, rsp => {
        if (rsp.status) {
            target_list.forEach(item => {
                $('#todo').prepend("<li>" + item + " <a href='#' aria-hidden='true'>&times;</a></li>");
            })
        } else {
            alert(rsp.msg)
        }
    })
});

$("body").on('click', '#todo a', function() { //刪除標籤
    let target = $(this).closest("li")[0].innerText.slice(0, -3) //取得標籤名稱
    let node = $(this).closest("li")[0]
    $.get(`http://127.0.0.1:3000/fb/del_fburl?id=${target}`, rsp => {
            if (rsp.status) {
                node.remove();
            } else {
                alert(rsp.msg)
            }
        })
        // chrome.runtime.sendMessage({
        //     type: 'del_id',
        //     target: target
        // }, function(response) {
        //     node.remove();
        //     console.log(response)
        // })
});

$('#page_send').on('click', function(e) {
    let k = parseInt($('#page_top_k')[0].value)
    let page_link = $('#page_link')[0].value
    chrome.runtime.sendMessage({
        type: 'get_links',
        topk: k,
        page_link: page_link
    }, function(rsp) {
        let data = {}
        data.fblist = JSON.stringify(rsp)
        console.log(data)
        $.post('http://127.0.0.1:3000/fb/add_fblist', data, r => {
            if (r.status) {
                console.log(rsp)
                let str = ''
                rsp.forEach((item, idx) => {
                    str = str + "<li>" + item + " <a href='#' aria-hidden='true'>&times;</a></li>"
                    if (idx == rsp.length - 1) {
                        $('#todo').html(str)
                    }
                })
            } else {
                alert(rsp.msg)
            }
        })
    })
})

$("#send").on('click', function(e) {
    let k = parseInt($('#top_k')[0].value)
    let name = $('#task_name')[0].value
    let db = $('#dblist :selected').val()
    $.get(`http://127.0.0.1:3000/fb/fb_list?task=${name}`, rsp => {
        if (rsp.status) {
            chrome.runtime.sendMessage({
                type: 'parse_post',
                topk: k,
                task: name,
                fb_list: rsp.fb_list,
                db: db
            }, function(response) {
                alert(response)
            })
        } else {
            alert(rsp.msg)
        }
    })
})

$("#list_file").on('change', function(e) {
    $("#filename")[0].innerText = e.target.files[0].name
})

$('#setting').click(function() {
    chrome.tabs.create({
        url: "chrome-extension://" + chrome.runtime.id + "/option/options.html"
    })
})

$('#logout').on('click', function() {
    $.get("http://127.0.0.1:3000/logout", r => {
        if (r.status) {
            localStorage.clear()
            chrome.browserAction.setPopup({
                "popup": "./popup/login.html"
            }, function() {
                window.location.href = "login.html";
            })
        } else {
            alert(r.msg)
        }
    })
});


$('#wq').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/wqueue.html"
    }, function() {
        window.location.href = "wqueue.html";
    })
});


$('#g_and_y').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/popup.html"
    }, function() {
        window.location.href = "popup.html";
    })
})