module.exports = {
    ignoreFiles: [
        'word_highlighter.scss',
        'word_highlighter.css.map',
        '.gitignore',
        '.sass-cache',
        'web-ext.js',
        '*.zip',
        'icon_src',
    ],
    build: {
        overwriteDest: true,
    },
    run: {
        startUrl: [
            'https://www.fanfiction.net/j/0/4/1/',
            'https://m.fanfiction.net/j/?s=4&cid=0&l=1',
            'https://forum.questionablequesting.com/threads/with-this-ring-young-justice-si-thread-fourteen.8938/',
            'https://www.royalroad.com/fiction/21501/dco--dungeon-core-online',
        ],
    }
}