(function() {
    'use-strict';

    function date2str(dy) {
        let y = dy.getFullYear() + ''
        let m = (dy.getMonth() + 1) < 10 ? '0' + (dy.getMonth() + 1) : '' + (dy.getMonth() + 1)
        let d = dy.getDate() < 10 ? '0' + dy.getDate() : '' + dy.getDate()
        let h = dy.getHours() < 10 ? '0' + dy.getHours() : '' + dy.getHours()
        let min = dy.getMinutes() < 10 ? '0' + dy.getMinutes() : '' + dy.getMinutes()
        let s = dy.getSeconds() < 10 ? '0' + dy.getSeconds() : '' + dy.getSeconds()
        return y + m + d + h + min + s
    }

    function get_url_search(str) {
        let start = str.indexOf("?")
        return str.slice(start)
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

    function parse_arr(arr) {
        arr = arr.map((item,idx) => {
            let data = {}
            data.title = $(item).find("#video-title")[0].innerText.trim()
            data.owner = $(item).find("#channel-name")[0].innerText.trim()
            data.rank = idx+1
            data.track_time = date2str(new Date())
            data.source = "youtube"
            let search_obj = new URLSearchParams(window.location.search)
            data.term = search_obj.get('search_query')
            if ($(item).find("#metadata-line span:contains('觀看次數')").length) {
                let viewcnt = $(item).find("#metadata-line span:contains('觀看次數')")[0].innerText.trim()
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
            if (item.localName == "ytd-video-renderer") {
                data.type = "video"
                data.introduce = $(item).find("#description-text")[0].innerText
            } else {
                data.type = "playlist"
                data.introduce = $(item).find("#list")[0].innerText
            }
            data.url = 'https://www.youtube.com' + $($(item).find("#thumbnail")[0]).attr("href")
            let search = get_url_search($($(item).find("#thumbnail")[0]).attr("href"))
            let search_param = new URLSearchParams(search)
            data.vid = search_param.get("v")
            let meta_bar = $(item).find("#metadata-line>span")
            if (meta_bar.length < 2) {
                data.post_time = "-"
            } else {
                let time_str = meta_bar[1].innerText.trim()
                data.post_time = handletime(time_str)
            }
            return data
        })
        return arr
    }

    function scroll_to_bottom(db) {
        let scroll_item = $($('ytd-app')[0])
        let scroll_height = scroll_item[0].scrollHeight
        let ori_list = $("ytd-video-renderer,ytd-playlist-renderer").get()
        let ori_len = ori_list.length
        window.scroll(0, scroll_height)
        setTimeout(function() {
            let video_list = $("ytd-video-renderer,ytd-playlist-renderer").get()
            let list_len = video_list.length
            if (ori_len == list_len) {
                let final = parse_arr(video_list)
                chrome.runtime.sendMessage({
                    type: 'save_data',
                    data: final,
                    db: db
                }, (r) => {
                    window.close();
                })
            } else if (list_len < 200) {
                scroll_to_bottom(db)
            } else {
                let final = parse_arr(video_list)
                chrome.runtime.sendMessage({
                    type: 'save_data',
                    data: final,
                    db: db
                }, (r) => {
                    window.close();
                })
            }
        }, 2000)
    }
    $(document).ready(function() {
        var db = window.location.hash.substring(1);
        scroll_to_bottom(db)
    })
})()

// vid title url owner viewcnt post_time introduce author type source track_time