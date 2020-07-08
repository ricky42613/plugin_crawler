(function() {
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
        let time = new Date();
        var d2 = new Date(time);
        if (str.indexOf("今天") != -1 || str.indexOf("小時前") != -1 || str.indexOf("分鐘前") != -1 || str.indexOf("剛剛") != -1) { //eX.15分鐘前 1小時前 剛剛
            let m = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : '' + (time.getMonth() + 1)
            let d = time.getDate() < 10 ? '0' + time.getDate() : '' + time.getDate()
            return time.getFullYear() + '' + m + '' + d + '000000'
        } else if (str.indexOf("星期") != -1) { //ex 星期一 15:30
            let curweek = time.getDay()
            let start = str.indexOf("星期")
            let week = str.slice(start, start + 3)
            let dif = curweek - my_week_table[week]
            d2.setDate(d2.getDate() - dif);
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else if (str.indexOf('天前') != -1) { //ex昨天 8:30
            d2.setDate(d2.getDate() - parseInt(str));
            let m = d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : '' + (d2.getMonth() + 1)
            let d = d2.getDate() < 10 ? '0' + d2.getDate() : '' + d2.getDate()
            return d2.getFullYear() + '' + m + '' + d + "000000"
        } else if (str.indexOf('年') != -1) { //ex 2015年8月30日
            let ystart = str.indexOf('年')
            let year = str.slice(0, ystart)
            let mstart = str.indexOf('月')
            let month = str.slice(ystart + 1, mstart)
            if (month.length < 2) {
                month = '0' + month
            }
            let dstart = str.indexOf('日')
            let date = str.slice(mstart + 1, dstart)
            if (date.length < 2) {
                date = '0' + date
            }
            return year + '' + month + '' + date + "000000"
        } else { //7月28日
            let mstart = str.indexOf('月')
            let month = str.slice(0, mstart)
            if (month.length < 2) {
                month = '0' + month
            }
            let dstart = str.indexOf('日')
            let date = str.slice(mstart + 1, dstart)
            if (date.length < 2) {
                date = '0' + date
            }
            return d2.getFullYear() + '' + month + '' + date + "000000"
        }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    console.log('already insert')
    $(document).ready(function() {
        var db = window.location.hash.substring(1);
        let rst = $(".g .r > a").map((idx, item) => {
            try {
                let data = {}
                data.title = $(item).find("h3,.nDgy9d")[0].innerText
                data.url = $(item).attr('href')
                let url_obj = new URL(data.url)
                data.site = url_obj.origin
                let search_obj = new URLSearchParams(window.location.search)
                data.term = search_obj.get('q')
                data.rank = idx + 1
                data.source = 'google'
                data.type = 1 //auto
                data.track_time = date2str(new Date())
                if ($(item).closest(".vsc,.rc").find(".f").length) {
                    let time_info = $(item).closest(".vsc,.rc").find(".f")[0].innerText.slice(0, -3)
                    data.post_time = handletime(time_info)
                } else {
                    data.post_time = "-"
                }
                return data
            } catch (e) {
                return null
            }
        }).get()
        chrome.runtime.sendMessage({
            type: 'save_data',
            data: rst,
            db: db
        }, (r) => {
            setTimeout(function() {
                let random_num = getRandomInt(8)
                $(".g .r > a")[random_num].click()
                    // window.close();
                chrome.runtime.sendMessage({
                    type: 'close_tab',
                }, (r) => {
                    console.log(r)
                })
            }, 5000)
        })
    })
})()