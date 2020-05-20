import { Payload, Store } from "vuex";
import set from "lodash-es/set";
import merge from "lodash-es/merge";
import isObject from "lodash-es/isObject";

/**
 * Save the store into session storage so that you can share it between pages
 * @example
 * new Vuex.Store({ plugins: [ createSessionStorage("[KEY]") ], .. });
 * @param {string?} key You can save only a part of the store if needed => store[key]
 * @returns {(store: Store<any>) => void}
 */
export default function createSessionStorage(key?: string): (store: Store<any>) => void {
    function doSubscribe(_mutation: Payload, state: any) {
        // Retrieve the data from the store
        const data = key ? state[key] : state;

        // Try to save it into the session storage called "vuex"
        try {
            window.sessionStorage.setItem("vuex", JSON.stringify(data));
        } catch {
            /* empty */
        }
    }

    return function(store: Store<any>) {
        // Retrive the data from the session storage
        const sessionData = window.sessionStorage.getItem("vuex");

        if (sessionData) {
            try {
                const parsedData = JSON.parse(sessionData);

                if (isObject(parsedData)) {
                    // If a key is defined, create a void store object in order to merge it
                    const data = key ? set({}, key, parsedData) : parsedData;

                    // Merge the current store with the retrieved data from session storage
                    store.replaceState(merge(store.state, data));
                }
            } catch {
                /* empty */
            }
        }

        store.subscribe(doSubscribe);
    };
}
