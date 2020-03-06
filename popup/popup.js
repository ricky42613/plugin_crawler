// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}

let author = ""
let timecnt
init_status(r => {
    if (r.status == false) {
        chrome.browserAction.setPopup({
            "popup": "./popup/login.html"
        }, function() {
            window.location.href = "login.html";
        })
    } else {
        author = r.config.acn
        timecnt = r.config.time_query
    }
})

$('#fblink').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/fbpage.html"
    }, function() {
        window.location.href = "fbpage.html";
    })
})

$('#wq').click(function(e) {
    e.preventDefault()
    chrome.browserAction.setPopup({
        "popup": "./popup/wqueue.html"
    }, function() {
        window.location.href = "wqueue.html";
    })
})

$('#setting').click(function() {
    chrome.tabs.create({
        url: "chrome-extension://" + chrome.runtime.id + "/option/options.html"
    })
})
$('#google').click(function() { //新增標籤
    let keyword = $("input[name=key_word]").val()
    let db = $('#dblist :selected').val()
    let target = []
    target.push(keyword)
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
                arr.push(keyword)
                console.log(arr)
                if(arr.length<=timecnt){
                    chrome.runtime.sendMessage({
                        type: 'google_parse',
                        word: arr,
                        db: db
                    }, function(response) {
                        console.log(response)
                    });
                }else{
                    alert('超過最大限制('+arr.length+'/'+timecnt+')')
                }
            };
        }
    } else {
        console.log(target)
        chrome.runtime.sendMessage({
            type: 'google_parse',
            word: target,
            db: db
        }, function(response) {
            console.log(response)
        });
    }
});
$('#youtube').click(function() { //新增標籤
    let keyword = $("input[name=key_word]").val()
    let db = $('#dblist :selected').val()
    let target = []
    target.push(keyword)
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
                arr.push(keyword)
                console.log(arr)
                chrome.runtime.sendMessage({
                    type: 'yt_parse',
                    word: arr,
                    db: db
                }, function(response) {
                    console.log(response)
                });
            };
        }
    } else {
        console.log(target)
        chrome.runtime.sendMessage({
            type: 'yt_parse',
            word: target,
            db: db
        }, function(response) {
            console.log(response)
        });
    }
});
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