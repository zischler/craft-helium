/**
 * Mouse Event polyfill
 */
try {
    new MouseEvent("test");
} catch (e) {
    var MouseEvent = function(eventType, params) {
        var mouseEvent = document.createEvent("MouseEvent");

        params = params || { bubbles: false, cancelable: false };
        mouseEvent.initMouseEvent(
            eventType,
            params.bubbles,
            params.cancelable,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null,
        );

        return mouseEvent;
    };

    MouseEvent.prototype = Event.prototype;
    window.MouseEvent = MouseEvent;
}

/**
 * append() polyfill
 * @see https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
 */
(function(arr) {
    arr.forEach(function(item) {
        if (item.hasOwnProperty("append")) {
            return;
        }
        Object.defineProperty(item, "append", {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function append() {
                var argArr = Array.prototype.slice.call(arguments),
                    docFrag = document.createDocumentFragment();

                argArr.forEach(function(argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(
                        isNode
                            ? argItem
                            : document.createTextNode(String(argItem)),
                    );
                });

                this.appendChild(docFrag);
            },
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

/**
 * Date.prototype.toISOString
 */
if ( !Date.prototype.toISOString ) {
    ( function() {

        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }

        Date.prototype.toISOString = function() {
            return this.getUTCFullYear()
                + '-' + pad( this.getUTCMonth() + 1 )
                + '-' + pad( this.getUTCDate() )
                + 'T' + pad( this.getUTCHours() )
                + ':' + pad( this.getUTCMinutes() )
                + ':' + pad( this.getUTCSeconds() )
                + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                + 'Z';
        };

    }() );
}
