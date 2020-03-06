//youtube 頁面腳本
(function() {
    'use strict';

    function date2str(dy) {
        let y = dy.getFullYear() + ''
        let m = (dy.getMonth() + 1) < 10 ? '0' + (dy.getMonth() + 1) : '' + (dy.getMonth() + 1)
        let d = dy.getDate() < 10 ? '0' + dy.getDate() : '' + dy.getDate()
        let h = dy.getHours() < 10 ? '0' + dy.getHours() : '' + dy.getHours()
        let min = dy.getMinutes() < 10 ? '0' + dy.getMinutes() : '' + dy.getMinutes()
        let s = dy.getSeconds() < 10 ? '0' + dy.getSeconds() : '' + dy.getSeconds()
        return y + m + d + h + min + s
    }

    function handletime(str) { //估算大約時間點 need fix
        if (str.indexOf("：") != -1) {
            str = str.slice(str.indexOf("：") + 1).trim()
        }
        let time = new Date();
        var d2 = new Date(time);
        if (str.indexOf("小時前") != -1 || str.indexOf("分鐘前") != -1) { //eX.15分鐘前 1小時前
            let m = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : '' + (time.getMonth() + 1)
            let d = time.getDate() < 10 ? '0' + time.getDate() : '' + time.getDate()
            return time.getFullYear() + '' + m + '' + d + '000000'
        } else if (str.indexOf("天") != -1) { //ex 星期一 15:30
            d2.setDate(d2.getDate() - parseInt(str));
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else if (str.indexOf("週") != -1) { //ex 星期一 15:30
            let dif = 7 * parseInt(str)
            d2.setDate(d2.getDate() - dif);
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else if (str.indexOf('月前') != -1) { //ex 月前
            d2.setMonth(d2.getMonth() - parseInt(str));
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else if (str.indexOf('年前') != -1) { //7月28日
            d2.setFullYear(d2.getFullYear() - parseInt(str));
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else {
            return "-"
        }
    }

    function get_url_search(str) {
        let start = str.indexOf("?")
        return str.slice(start)
    }

    let collect_list = []
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if ("get_url_list" == request.type) { //回傳已選擇的影片列表
                sendResponse(collect_list);
                collect_list = []
            } else if ("click_all" == request.type) { //全選影片
                $(".for_nucloud").map((idx, item) => {
                    if (!$(item).prop('checked')) {
                        $(item).click()
                    }
                    if (idx == $(".for_nucloud").length - 1) {
                        sendResponse("finish")
                    }
                })
            } else if ("cancel_all" == request.type) { //取消所有選擇的影片
                collect_list.length = 0
                $(".for_nucloud").map((idx, item) => {
                    $(item).prop('checked', false)
                    if (idx == $(".for_nucloud").length - 1) {
                        sendResponse("finish")
                    }
                })
            }
            return true
        }
    );
    document.addEventListener("contextmenu", function(e) {
        if (undefined !== typeof chrome.runtime.isInstalled) {
            var elem = e.srcElement
            var imghtml = e.srcElement.outerHTML;
            if (elem instanceof HTMLImageElement) { //判斷點擊元素是否為圖片
                var img = {
                    alt: elem.alt,
                    height: elem.height,
                    width: elem.width,
                }
                chrome.runtime.sendMessage({
                    img: img,
                    type: 'img',
                    snapshot: elem.src,
                    element: imghtml
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }, true);

    function addcheck(item) { //選取影片
        //<input class="for_nucloud" type="checkbox">
        var x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.setAttribute("class", "for_nucloud")
        x.addEventListener('click', (ev) => {
            let data = {}
            ev.stopPropagation()
            let render_body = $(ev.target).closest("ytd-video-renderer,ytd-playlist-renderer,ytd-rich-grid-video-renderer")[0]
            data.title = $(render_body).find("#video-title")[0].innerText.trim()
            data.owner = $(render_body).find("#channel-name")[0].innerText.trim()
            data.track_time = date2str(new Date())
            data.source = "youtube"
            let search_obj = new URLSearchParams(window.location.search)
            data.term = search_obj.get('search_query') == null ? "" : search_obj.get('search_query')
            if ($(render_body).find("#metadata-line span:contains('觀看次數')").length) {
                let viewcnt = $(render_body).find("#metadata-line span:contains('觀看次數')")[0].innerText.trim()
                let start = viewcnt.indexOf("：")
                viewcnt = viewcnt.slice(start + 1, -1).trim()
                let basic = parseFloat(viewcnt)
                if (viewcnt.indexOf('萬') != -1) {
                    data.viewcnt = basic * 10000
                } else if (viewcnt.indexOf('億') != -1) {
                    data.viewcnt = basic * 100000000
                } else {
                    data.viewcnt = basic
                }
            } else {
                data.viewcnt = "-"
            }
            let search = get_url_search($($(render_body).find("#thumbnail")[0]).attr("href"))
            let search_param = new URLSearchParams(search)
            data.vid = search_param.get("v")
            if (search_param.get("list") == null) {
                data.type = "video"
                data.introduce = $(render_body).find("#description-text").length == 0 ? "" : $(render_body).find("#description-text")[0].innerText
            } else {
                data.type = "playlist"
                data.introduce = $(render_body).find("#list").length == 0 ? "" : $(render_body).find("#list")[0].innerText
            }
            data.url = 'https://www.youtube.com' + $($(render_body).find("#thumbnail")[0]).attr("href")
            let meta_bar = $(render_body).find("#metadata-line>span")
            if (meta_bar.length < 2) {
                data.post_time = "-"
            } else {
                let time_str = meta_bar[1].innerText.trim()
                data.post_time = handletime(time_str)
            }
            if ($(ev.target).prop('checked')) {
                collect_list.push(data)
            } else {
                let del_at
                collect_list.forEach((item, idx) => {
                    if (item.link == data.link) {
                        del_at = idx
                        return
                    }
                })
                collect_list.splice(del_at, 1)
            }
        })
        if ($(item).find('input').length == 0) { //判斷是否已加入過checkbox
            $(item).prepend(x)
        }
    }
    let videos = $("[id=video-title]") //所有影片
    videos.map((idx, item) => {
        addcheck(item)
    })
    $("body").bind('DOMNodeInserted', function(ev) {
        if ($(ev.target).find('#video-title').length) {
            addcheck($(ev.target).find('#video-title')[0])
        }
    })

})()