(function() {
    let key_term = window.location.hash.slice(1)
    $('[title="Google 搜尋"]').val(decodeURIComponent(key_term))
    setTimeout(function() {
        $('[aria-label="Google 搜尋"]').click()
    }, 2000)
})()