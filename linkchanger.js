'use strict';

RegExp.escape= function(s) {
    if (typeof s === 'string' || s instanceof String) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else if (s instanceof Array) {
        return s.map(elem => RegExp.escape(elem));
    }
    throw `RegExp.escape not implemented for ${typeof s}.`;
};

(function () {
    /*
    Check and set a global guard variable.
    If this content script is injected into the same page again,
    it will do nothing next time.
    */
    if (window.linkChangerHasRun) {
        console.log('link changer has already been initialized.');
        return;
    }
    window.linkChangerHasRun = true;

    let supported_domain_paths = [
        {
            'domain': 'fanfiction.net',
            'path': /^\/s\/\d+\/1\//,
            'place_img': (image, link) => {
                if (link.childNodes.length > 0 && link.childNodes[0].nodeType === Node.ELEMENT_NODE)
                    link.childNodes[0].style.clear = 'none';
                link.parentNode.insertBefore(image, link);
            },
            'links_add': {
                'path': ['anime', 'book', 'cartoon', 'comic', 'game', 'misc', 'play', 'movie', 'tv', '[^/]+-crossovers'].map(s => s + '/.+'),
                'add': '?srt=3&lan=1&r=10'
            }
        },
        // {'domain': 'archiveofourown.org', 'path': 'works/'},
        {
            'domain': 'literotica.com',
            'path': /^(?:\/beta)\/s\//,
            'place_img': (image, link) => link.parentNode.insertBefore(image, link),
        },
        // {'domain': 'hentai-foundry.com', 'path': 'stories/'},
        // {'domain': 'hpfanficarchive.com', 'path': 'stories/viewstory.php'},
        {
            'domain': 'tthfanfic.org',
            'path': /^\/Story-\d+\//,
            'place_img': (image, link) => {
                let node = link.parentNode.parentNode;
                if (node.link_changer_set)
                    return;
                node.link_changer_set = true;
                node.childNodes[node.childNodes.length - 1].style.clear = 'none';
                node.insertBefore(image, node.childNodes[0]);
            }
        },
    ];
    for (let domain of supported_domain_paths) {
        domain.domain_regex = new RegExp(`^(?:(?:www|m)\\.)?${RegExp.escape(domain.domain)}$`, 'i');
        if (!domain.path instanceof RegExp) {
            domain.path = new RegExp('^/' + RegExp.escape(path));
        }
        if (domain.links_add) {
            let links_add_add = domain.links_add.path.map(s => '(^/' + s + ')').join('|');
            domain.links_add_regex = new RegExp(links_add_add, 'i');
        }
    }

    function get_supported_domain(url) {
        for (let supported_domain_path of supported_domain_paths) {
            if (supported_domain_path.domain_regex.test(url.hostname)) {
                return supported_domain_path;
            }
        }
        // console.log('domain not supported:', url);
        return false;
    }

    function is_story_url(url) {
        if (window.location.hostname === url.hostname && window.location.pathname === url.pathname)
            return false;
        let domain = get_supported_domain(url);
        if (domain && domain.path.test(url.pathname))
                return true;
        // console.log('site not supported:', url);
        return false;
    }

    function get_links_add(url) {
        if (window.location.hostname === url.hostname && window.location.pathname === url.pathname)
            return false;
        let domain = get_supported_domain(url);
        if (domain && domain.links_add_regex && domain.links_add_regex.test(url.pathname))
            return domain.links_add.add;
        return false;
    }

    function start_download(event) {
        let url = event.target.dataset.url;
        browser.runtime.sendMessage({ACTION: 'download', data: {url: url}});
    }

    function add_to_link(link) {
        let domain = get_supported_domain(link);
        if (domain && domain.place_img && domain.path.test(link.pathname)) {
            // console.log('link found:', link);
            const icon_link = document.createElement('a');
            //icon_link.setAttribute('href', url_to_link(link.href));
            icon_link.setAttribute('title', 'open in converter');
            icon_link.addEventListener('mousedown', start_download, false);
            icon_link.dataset.url = link.href;
            icon_link.classList.add('fiction_sender_link');

            const size_rect = link.parentElement.getBoundingClientRect();
            const size = Math.ceil(Math.min(size_rect.height, size_rect.width) * .8);
            icon_link.style.height = size + 'px';
            icon_link.style.width = size + 'px';
            icon_link.style.marginRight = Math.floor(size / 3) + 'px';

            domain.place_img(icon_link, link);
        } else if (link.search === '') {
            let add = get_links_add(link);
            if (add)
                link.search = add;
        }
    }

    for (let elem of document.getElementsByClassName('fiction_sender_link')) {
        elem.parentNode.removeChild(elem);
    }

    let css = document.createElement('style');
    css.textContent = `
        .fiction_sender_link {
            cursor: pointer;
            display: inline-block;
            float: left;
            background: no-repeat url("${ browser.extension.getURL('icon/icon48.png') }");
            background-size: 100%; 
            clear: left;
        }
    `;

    document.head.append(css);

    for (let link of Array.from(document.links)) {
        add_to_link(link);
    }

    let observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            console.log('mutation:', mutation);
        }
    })

    observer.observe(document.body, {childList: true});
})();