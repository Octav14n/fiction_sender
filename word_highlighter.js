// ==UserScript==
// @name     Word Highlighter
// @version  1
// @grant    none
// @include *://*.fanfiction.net/*
// ==/UserScript==
'use strict';

let css = document.createElement('link');
css.href = browser.extension.getURL('word_highlighter.css');
css.rel = 'stylesheet';
document.head.append(css);

const metadatas = document.querySelectorAll('div.z-padtop2.xgray');
for (const meta_parent of metadatas) {
    let nodes = document.createDocumentFragment();
    let isCrossover = false;
    let isGenre = true;
    for (let meta of meta_parent.childNodes) {
        if (meta.nodeType === Node.TEXT_NODE) {
            let texts = meta.textContent.split(' - ').map(t => t.trim())
            for (let text of texts) {
                let elem = document.createElement('span');
                if (isGenre && text.startsWith('Rated:'))
                    isGenre = false;
                if (isGenre && text !== 'Crossover') {
                    isGenre = false;

                    let genres = isCrossover ? text.split(' & ') : [text];
                    for (let genre of genres) {
                        let e = document.createElement('span');
                        e.classList.add('genre');
                        e.appendChild(document.createTextNode(genre));
                        elem.appendChild(e);
                    }
                } else
                    elem.appendChild(document.createTextNode(text));
                nodes.appendChild(elem);

                if (text.startsWith('Words:')) {
                    let words = Number(text.replace(/\D/g, ''));
                    elem.classList.add('words');
                    meta_parent.parentNode.parentNode.classList.add('word_' + (words < 20000 ? 'low' : 'high'));
                }
                if (text === 'Crossover') {
                    isCrossover = true;
                    isGenre = true;
                }
            }
            // noinspection JSCheckFunctionSignatures
        } else {
            nodes.appendChild(meta.cloneNode(true));
        }
    }
    meta_parent.innerHTML = '';
    meta_parent.appendChild(nodes);
}