module.exports = {
    ignoreFiles: [
        'word_highlighter.scss',
        'word_highlighter.css.map',
        '.gitignore',
        '.sass-cache',
        '.idea',
        'web-ext.js',
        'web-ext-config.js',
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
            'https://www.fanfiction.net/u/777540/Bobmin356#fs',
            'https://forum.questionablequesting.com/threads/with-this-ring-young-justice-si-thread-fourteen.8938/',
            'https://www.royalroad.com/fiction/21501/dco--dungeon-core-online',
            'about:devtools-toolbox?id=fiction_sender%40schnuff.eu&type=extension',
        ],
        browserConsole: true,
    },
    sign: {
        channel: "listed",
    }
}