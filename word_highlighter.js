// ==UserScript==
// @name     Word Highlighter
// @version  1
// @grant    none
// @include *://*.fanfiction.net/*
// ==/UserScript==
'use strict';

const isMobile = window.location.hostname.startsWith('m.');

let css = document.createElement('link');
css.href = browser.extension.getURL('word_highlighter.css');
css.rel = 'stylesheet';
document.head.append(css);

const metadatas = document.querySelectorAll('div.z-padtop2.xgray, div.gray');
const splitter = isMobile ? ', ' : ' - ';
for (const meta_parent of metadatas) {
    let nodes = document.createDocumentFragment();
    let isCrossover = false;
    let isGenre = true;
    let isPublished = false;
    for (let meta of meta_parent.childNodes) {
        if (meta.nodeType === Node.TEXT_NODE && (isMobile && isPublished)) {
            // Characters in mobile.
            let text = meta.textContent.substr(2).trim();
            let elem = document.createElement('span');
            elem.appendChild(document.createTextNode(text));
            nodes.appendChild(elem);
        } else if (meta.nodeType === Node.TEXT_NODE) {
            let texts = meta.textContent.split(splitter).map(t => t.trim())
            for (let text of texts) {
                let elem = document.createElement('span');
                if (isGenre && text.startsWith('Rated:'))
                    isGenre = false;
                if (isGenre && text !== 'Crossover') {
                    isGenre = false;

                    let genres = text.split(' & ');
                    for (let genre of genres) {
                        let e = document.createElement('span');
                        e.classList.add('genre');
                        e.appendChild(document.createTextNode(` ${genre} `));
                        elem.appendChild(e);
                    }
                } else
                    elem.appendChild(document.createTextNode(text));
                nodes.appendChild(elem);

                if (text.toLowerCase().startsWith('words:')) {
                    let words = Number(text.replace('k', '000').replace(/\D/g, ''));
                    elem.classList.add('words');
                    let parent = isMobile ? meta_parent.parentNode : meta_parent.parentNode.parentNode;
                    parent.classList.add('word_' + (words < 20000 ? 'low' : 'high'));
                }
                if (text === 'Crossover') {
                    isCrossover = true;
                    isGenre = true;
                }
                if (text === 'published:')
                    isPublished = true;
            }
        } else {
            nodes.appendChild(meta.cloneNode(true));
        }
    }
    meta_parent.innerHTML = '';
    meta_parent.appendChild(nodes);
}