module.exports = {
    ignoreFiles: [
        'word_highlighter.scss',
        'word_highlighter.css.map',
        '.gitignore',
        '.sass-cache',
        'web-ext.js',
        '*.zip',
        'icon_src',
        'icon/*.svg',
    ],
    build: {
        overwriteDest: true,
    },
    run: {
        startUrl: [
            'https://www.fanfiction.net/j/0/4/1/'
        ],
    }
}