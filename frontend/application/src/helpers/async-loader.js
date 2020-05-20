var urlList = new Set();
var loadJSPromise = null;
var loadCSSPromise = null;
export function loadJS(src, crossOrigin, integrity) {
    if (crossOrigin === void 0) { crossOrigin = false; }
    if (integrity === void 0) { integrity = ''; }
    if (urlList.has(src)) {
        return loadJSPromise;
    }
    loadJSPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.onload = function (event) { return resolve(event); };
        script.onerror = function (event) { return reject(event); };
        script.async = true;
        if (typeof crossOrigin === "string") {
            script.crossOrigin = crossOrigin;
        }
        script.integrity = integrity;
        script.src = src;
        document.head.appendChild(script);
        urlList.add(src);
    });
    return loadJSPromise;
}
export function loadCSS(src, crossOrigin, integrity, media) {
    if (crossOrigin === void 0) { crossOrigin = false; }
    if (integrity === void 0) { integrity = ''; }
    if (media === void 0) { media = 'screen'; }
    if (urlList.has(src)) {
        return loadCSSPromise;
    }
    loadCSSPromise = new Promise(function (resolve, reject) {
        var link = document.createElement('link');
        link.addEventListener('load', function (event) { return resolve(event); });
        link.addEventListener('error', function (event) { return reject(event); });
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('media', media);
        if (typeof crossOrigin === "string") {
            link.crossOrigin = crossOrigin;
        }
        link.integrity = integrity;
        link.setAttribute('href', src);
        document.head.appendChild(link);
        urlList.add(src);
    });
    return loadCSSPromise;
}
//# sourceMappingURL=async-loader.js.map