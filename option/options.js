// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function init_status(cb) {
    $.get('http://127.0.0.1:3000/get_info', r => {
        console.log(r)
        cb(r)
    })
}
let author = ""
let daycnt
    // = $("#daycnt").val(localStorage.getItem("daycnt"))
let timecnt
    //  = $("#timecnt").val(localStorage.getItem("timecnt"))
let site
    //  = $("#site").val(localStorage.getItem("site"))

init_status(r => {
    if (r.status) {
        author = r.config.acn
        daycnt = r.config.day_query
        $("#daycnt").val(daycnt)
        timecnt = r.config.time_query
        $("#timecnt").val(timecnt)
        site = r.config.machine
        $("#site").val(site)
    } else {
        author = ""
        alert("請先登入後重新整理")
    }
})

$('body').on('click', '.update', function() {
    if (author.length > 0) {
        let data = {}
        data.author = author
        data.daycnt = $("#daycnt").val()
        data.timecnt = $("#timecnt").val()
        data.site = $("#site").val()
        $.post('http://127.0.0.1:3000/update', data, r => {
            chrome.runtime.sendMessage({
                type: 'update',
                info: {
                    acn: author,
                    machine: data.site,
                    day_query: data.daycnt,
                    time_query: data.timecnt,
                }
            }, rsp => {
                console.log(rsp)
                author = data.author
                daycnt = data.daycnt
                timecnt = data.timecnt
                site = data.site
                alert("success")
            })
        })
    } else {
        alert("login first")
    }
})