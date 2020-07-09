// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let author = ""
    // = localStorage.getItem("author") == null ? "" : localStorage.getItem("author")
let dblist = ["edu_link", "key_link", "yt_104", "test", "travel_link", "yt_104_2"]
let db_site
    // = localStorage.getItem("site") == null ? "http://nubot70.taiwin.tw:5802" : localStorage.getItem("site")
let daycnt
    // = localStorage.getItem("daycnt") == null ? 100 :parseInt(localStorage.getItem("daycnt"))
let timecnt
    // = localStorage.getItem("timecnt") ==null ? 100 : parseInt(localStorage.getItem("timecnt"))
let auto_tab = []

function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}

function send_to_edu(data, db) {
    if (author.length && data.length) {
        let rec = {
            record: JSON.stringify(data.map(item => {
                item.author = author
                return item
            }))
        };
        $.post(db_site + '/nudb/rput?db=' + db + '&format=json', rec, r => {
            console.log(r)
        })
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function google_parse(arr, idx, db) {
    let random_num = getRandom(10, 21)
    setTimeout(function() {
        $.get('http://127.0.0.1:3000/addcnt', r => {
            if (r.status) {
                chrome.tabs.create({
                    url: "https://www.google.com#" + arr[idx].replace(/\s/g, "+")
                }, rsp => {
                    chrome.tabs.executeScript(rsp.id, {
                        file: "jquery-3.3.1.min.js"
                    }, function() {
                        if (chrome.runtime.lastError) {
                            var errorMsg = chrome.runtime.lastError.message;
                            console.log(errorMsg)
                        } else {
                            chrome.tabs.executeScript(rsp.id, {
                                file: "home_page.js"
                            }, function() {
                                if (chrome.runtime.lastError) {
                                    var errorMsg = chrome.runtime.lastError.message;
                                    console.log(errorMsg)
                                } else {
                                    setTimeout(function() {
                                        chrome.tabs.executeScript(rsp.id, {
                                            file: "jquery-3.3.1.min.js"
                                        }, function() {
                                            if (chrome.runtime.lastError) {
                                                var errorMsg = chrome.runtime.lastError.message;
                                                console.log(errorMsg)
                                            } else {
                                                chrome.tabs.executeScript(rsp.id, {
                                                    code: "localStorage.setItem('auto_db','" + db + "');"
                                                }, function() {
                                                    if (chrome.runtime.lastError) {
                                                        var errorMsg = chrome.runtime.lastError.message;
                                                        console.log(errorMsg)
                                                    } else {
                                                        chrome.tabs.executeScript(rsp.id, {
                                                            file: "google_auto.js"
                                                        }, function() {
                                                            console.log(idx)
                                                            console.log(arr.length)
                                                            if (chrome.runtime.lastError) {
                                                                var errorMsg = chrome.runtime.lastError.message;
                                                                console.log(errorMsg)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                        if (idx + 1 < arr.length) {
                                            idx++
                                            google_parse(arr, idx, db)
                                        }
                                    }, 8000)
                                }
                            })
                        }
                    })
                });
            } else {
                console.log(r.msg)
            }
        })
    }, 10000)
}

function yt_parse(arr, idx, db) {
    setTimeout(function() {
        chrome.tabs.create({
            url: "https://www.youtube.com/results?search_query=" + arr[idx].replace(/\s/g, "+") + "#" + db
        }, rsp => {
            chrome.tabs.executeScript(rsp.id, {
                file: "jquery-3.3.1.min.js"
            }, function() {
                if (chrome.runtime.lastError) {
                    var errorMsg = chrome.runtime.lastError.message;
                    console.log(errorMsg)
                } else {
                    chrome.tabs.executeScript(rsp.id, {
                        file: "jquery-ui.js"
                    }, function() {
                        if (chrome.runtime.lastError) {
                            var errorMsg = chrome.runtime.lastError.message;
                            console.log(errorMsg)
                        } else {
                            chrome.tabs.executeScript(rsp.id, {
                                file: "youtube_auto.js"
                            }, function() {
                                console.log(idx)
                                console.log(arr.length)
                                if (chrome.runtime.lastError) {
                                    var errorMsg = chrome.runtime.lastError.message;
                                    console.log(errorMsg)
                                }
                            })
                        }
                    })
                }
            })
            if (idx + 1 < arr.length) {
                idx++
                yt_parse(arr, idx, db)
            }
        })
    }, 20000)
}

function onClickHandler(info, tab) {
    if (info.parentMenuItemId == "join_db") {
        console.log(info)
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'get_url_list'
            }, function(response) {
                send_to_edu(response, info.menuItemId)
            })
        })
    } else if (info.menuItemId == "clickall") { //全選youtube頁面中的影片
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'click_all'
            })
        })
    } else if (info.menuItemId == "cancelall") { //取消所有youtube頁面中選取的影片
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'cancel_all'
            })
        })
    }
}

init_status(rsp => {
    if (rsp.status) {
        chrome.browserAction.setPopup({ //設定popup頁面
                "popup": "./popup/popup.html"
            }, function() {
                author = rsp.config.acn
                db_site = rsp.config.machine
                    // localStorage.setItem("site",author)
                daycnt = rsp.config.day_query
                    // localStorage.setItem("daycnt",daycnt)
                timecnt = rsp.config.time_query
            })
            // localStorage.setItem("timecnt",timecnt)
    } else {
        chrome.browserAction.setPopup({ //設定popup頁面
            "popup": "./popup/login.html"
        })
        console.log(rsp.msg)
    }
})

chrome.contextMenus.onClicked.addListener(onClickHandler);


chrome.runtime.onInstalled.addListener(function(details) {
    chrome.contextMenus.create({
        title: "加入link DB",
        id: "join_db",
        contexts: ["all"],
        documentUrlPatterns: ["https://www.google.com/*", "https://www.youtube.com/*"]
    })
    chrome.contextMenus.create({
        title: "全選",
        id: "clickall",
        contexts: ["all"],
        documentUrlPatterns: ["https://www.google.com/*", "https://www.youtube.com/*"]
    })
    chrome.contextMenus.create({
        title: "取消全選",
        id: "cancelall",
        contexts: ["all"],
        documentUrlPatterns: ["https://www.google.com/*", "https://www.youtube.com/*"]
    })
    dblist.forEach(item => {
        chrome.contextMenus.create({
            title: item,
            parentId: "join_db",
            id: item,
            contexts: ["all"],
        });
    })
})

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return { cancel: details.type == "image" && details.initiator == "chrome-extension://bhilfdpankmepagekoapnggoiokoeeai" };
    }, {
        urls: ["<all_urls>"]
    }, ["blocking"]
);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type == "google_parse") {
            sendResponse('ok')
            google_parse(request.word, 0, request.db)
        } else if (request.type == "save_data") {
            send_to_edu(request.data, request.db)
            sendResponse('ok')
        } else if (request.type == "register") {
            author = request.author
            sendResponse("ok")
        } else if (request.type == "yt_parse") {
            sendResponse("ok")
            yt_parse(request.word, 0, request.db)
        } else if (request.type == "user_info") {
            author = request.info.acn
                // localStorage.setItem("author", author)
                // init_status(rsp => {
                //     if (rsp.status) {
            db_site = request.info.machine
                // localStorage.setItem("site",author)
            daycnt = request.info.day_query
                // localStorage.setItem("daycnt",daycnt)
            timecnt = request.info.time_query
            sendResponse("ok")
                // localStorage.setItem("timecnt",timecnt)
                // } else {
                //     sendResponse("fail," + r.msg)
                //     console.log(r.msg)
                // }
                // })
        } else if (request.type == "update") {
            author = request.info.acn
            db_site = request.info.machine
                // localStorage.setItem("site",author)
            daycnt = request.info.day_query
                // localStorage.setItem("daycnt",daycnt)
            timecnt = request.info.time_query
            sendResponse("ok")
        } else if (request.type == "close_tab") {
            sendResponse("got it")
            setTimeout(function() {
                chrome.tabs.remove(sender.tab.id)
            }, 10000)
        }
        return true
    }
)

chrome.tabs.onUpdated.addListener(function(tabID, info) {
    if (info.status == 'complete' && author.length) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            if (tabs.length) {
                if (tabs[0].url.indexOf("www.google.com/search") != -1) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        file: "jquery-3.3.1.min.js"
                    }, function() {
                        if (chrome.runtime.lastError) {
                            var errorMsg = chrome.runtime.lastError.message;
                            console.log(errorMsg)
                        } else {
                            chrome.tabs.executeScript(tabs[0].id, {
                                file: 'google_srh.js'
                            }, function() {
                                if (chrome.runtime.lastError) {
                                    var errorMsg = chrome.runtime.lastError.message;
                                    console.log(errorMsg)
                                }
                            })
                        }
                    })
                } else if (tabs[0].url.indexOf("www.youtube.com") != -1) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        file: "jquery-3.3.1.min.js"
                    }, function() {
                        if (chrome.runtime.lastError) {
                            var errorMsg = chrome.runtime.lastError.message;
                            console.log(errorMsg)
                        } else {
                            chrome.tabs.executeScript(tabs[0].id, {
                                file: 'youtube_src.js'
                            }, function() {
                                if (chrome.runtime.lastError) {
                                    var errorMsg = chrome.runtime.lastError.message;
                                    console.log(errorMsg)
                                }
                            })
                        }
                    })
                }
            }
        })
    }
})