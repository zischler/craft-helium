export function isTablet(): boolean {
    return getWidth() >= 768 && getWidth() < 992;
}

export function isMobile(): boolean {
    return getWidth() < 768;
}

export function isMobileXs(): boolean {
    return getWidth() < 544;
}

export function isEnglishPage(): boolean {
    return window.location.href.includes("/en/") || window.location.href.includes("/en#");
}

export function getBaseWindowTitle(): string {
    const firstLinePos = document.title.indexOf("–");
    const lastLinePos = document.title.lastIndexOf("–");
    if(firstLinePos !== lastLinePos) {
        return document.title.substring(0, document.title.lastIndexOf("–"));
    } else {
        return document.title;
    }
}

function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}
