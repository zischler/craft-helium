const BrowserStorage = (function() {
    /**
     * Whether the current browser supports local storage as a way of storing data
     * @var {Boolean}
     */
    const _hasLocalStorageSupport = (function() {
        try {
            localStorage.setItem('_storage_test', 'test');
            localStorage.removeItem('_storage_test');
            return true;
        } catch (e) {
            return false;
        }
    })();

    /**
     * @param {String} name The name of the property to read from this document's cookies
     * @return {?String} The specified cookie property's value (or null if it has not been set)
     */
    const _readCookie = function(name) {
        const nameEQ = name + "=";
        const cookieArr = document.cookie.split(';');
        let cookieValue = "";
        for (const cookieItem of cookieArr) {
            let c = cookieItem;
            while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
            if (c.indexOf(nameEQ) === 0) { cookieValue = c.substring(nameEQ.length, c.length); }
        }

        return cookieValue;
    };

    /**
     * @param {String} name The name of the property to set by writing to a cookie
     * @param {String} value The value to use when setting the specified property
     * @param {int} [days] The number of days until the storage of this item expires
     */
    const _writeCookie = function(name, value, days) {
        const expiration = (function() {
            if (days) {
                const date = new Date();
                const cookieTimeout = days * 24 * 60 * 60 * 1000;
                date.setTime(date.getTime() + cookieTimeout);
                return "; expires=" + date.toUTCString();
            }
            else {
                return "";
            }
        })();

        document.cookie = name + "=" + value + expiration + "; path=/";
    };

    return {
        /**
         * @param {String} name The name of the property to set
         * @param {String} value The value to use when setting the specified property
         * @param {int} [days] The number of days until the storage of this item expires (if storage of the provided item must fallback to using cookies)
         */
        set(name, value, days) {
            _hasLocalStorageSupport
                ? localStorage.setItem(name, value)
                : _writeCookie(name, value, days);
        },

        setCookie(name, value, days) {
            _writeCookie(name, value, days);
        },

        /**
         * @param {String} name The name of the value to retrieve
         * @return {?String} The value of the
         */
        get(name) {
            return _hasLocalStorageSupport
                ? localStorage.getItem(name)
                : _readCookie(name);
        },

        getCookie(name) {
            return _readCookie(name) || "";
        },

        checkCookie(name) {
            return _readCookie(name) !== null;
        },

        getBooleanCookie(name) {
            return _readCookie(name) && _readCookie(name) === "true";
        },

        deleteCookie(name) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            const expires = ";expires="+d;
            const value="";
            document.cookie = name + "=" + value + expires + "; path=/";
        },

        clearAllCookies() {
            const cookies = document.cookie.split(";");
            for (const cookie of cookies) {
                const cookieObj = cookie.split("=");
                this.deleteCookie(cookieObj[0]);
            }
        },

        clearCookiesStartWith(nameStart) {
            const cookies = document.cookie.split(";");
            for (const cookie of cookies) {
                const cookieObj = cookie.split("=");
                const cookieName = cookieObj[0].trim();
                if(nameStart && cookieName.startsWith(nameStart)) {
                    this.deleteCookie(cookieObj[0]);
                }
            }
        },

        /**
         * @param {String} name The name of the value to delete/remove from storage
         */
        remove(name) {
            _hasLocalStorageSupport
                ? localStorage.removeItem(name)
                : this.set(name, "", -1);
        },

        removeCookie(name) {
            this.set(name, "", -1);
        }
    };

})();

export default BrowserStorage;
