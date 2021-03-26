
let targetUrl = () => document.getElementById('targetUrl');
document.getElementsByTagName('form')[0].addEventListener('submit', function (evt) {
    let url = targetUrl().value;
    let permissionsToRequest = {
        origins: [url]
    }

    browser.permissions.request(permissionsToRequest).then(() =>
    {
        browser.storage.sync.set({
            targetUrl: url
        });
    }).catch((err) => {
        window.console.error(err);
    });
    evt.preventDefault();
})
document.addEventListener('DOMContentLoaded', function (evt) {
    browser.storage.sync.get('targetUrl').then((res) => {
        targetUrl().value = res.targetUrl || 'http://localhost/';
    })
});