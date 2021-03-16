
RegExp.escape= function(s) {
    if (typeof s === 'string' || s instanceof String) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else if (s instanceof Array) {
        return s.map(elem => RegExp.escape(elem));
    }
    throw `RegExp.escape not implemented for ${typeof s}.`;
};



let supported_domain_paths = [
    {'domain': 'fanfiction.net', 'path': 's/'},
    {'domain': 'archiveofourown.org', 'path': 'works/'},
    {'domain': 'literotica.com', 'path': 's/'},
    {'domain': 'literotica.com', 'path': 'beta/s/'},
    {'domain': 'hentai-foundry.com', 'path': 'stories/'},
    {'domain': 'hpfanficarchive.com', 'path': 'stories/viewstory.php'},
    {'domain': 'tthfanfic.org', 'path': 'Story-'},
    {'domain': 'forum.questionablequesting.com', 'path': 'threads/'},
    {'domain': 'royalroad.com', 'path': 'fiction/'},
];
for (let supported_domain_path of supported_domain_paths) {
    supported_domain_path.domain_regex = new RegExp(`^(?:www\\.)?${RegExp.escape(supported_domain_path.domain)}$`, 'i');
}


console.log('supported domains: ', supported_domain_paths);

let start_download = function(data) {
    try {
        browser.history.addUrl({url: data.url});
    } catch {
        // Ignore if history is not accessible. (Firefox for Android for example)
    }
    if (this.xhr === undefined) {
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 300) {
                    // Request OK
                } else {
                    console.error('Could not start FanFic download. Status-Code:', this.status, 'Answer:', this.body, 'Request:', this);
                }
            }
        }
    }
    browser.storage.sync.get('targetUrl').then((res) => {
        this.xhr.open('POST', res.targetUrl, true);
        this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.xhr.send(`url=${encodeURIComponent(data.url)}`);
    });
}

browser.runtime.onMessage.addListener(function (evt) {
    switch (evt.ACTION) {
        case 'download':
            start_download(evt.data);
            break;
        default:
            console.error('Invalid message ACTION:', evt.ACTION, 'evt:', evt);
    }
})

function is_story_url(url) {
    for (let supported_domain_path of supported_domain_paths) {
        if (supported_domain_path.domain_regex.test(url.hostname) &&
            url.pathname.startsWith('/' + supported_domain_path.path)) {
            // console.log('site is supported:', url);
            return true;
        }
    }
    // console.log('site not supported:', url);
    return false;
}

function convertActive(tab) {
    start_download({url: tab.url});
}

browser.pageAction.onClicked.addListener(convertActive);

function initializePageAction(prevId, changeInfo, tab) {
    if (!tab) return;
    window.console.debug(tab);
    let url = new URL(tab.url);
    if (is_story_url(url)) {
        browser.pageAction.show(tab.id);
    } else {
        browser.pageAction.hide(tab.id);
    }
}

browser.tabs.onActivated.addListener(initializePageAction);

let on_update_listener_urls = [];
for (let supported_domain_path of supported_domain_paths) {
    on_update_listener_urls.push(`*://*.${supported_domain_path.domain}/${supported_domain_path.path}*`);
}
console.log('listening to sites:', on_update_listener_urls);
browser.tabs.onUpdated.addListener(initializePageAction, {
    urls: on_update_listener_urls,
    windowId: browser.windows.WINDOW_ID_CURRENT
});