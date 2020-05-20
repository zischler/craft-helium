import set from "lodash-es/set";
import merge from "lodash-es/merge";
import isObject from "lodash-es/isObject";
export default function createSessionStorage(key) {
    function doSubscribe(_mutation, state) {
        const data = key ? state[key] : state;
        try {
            window.sessionStorage.setItem("vuex", JSON.stringify(data));
        }
        catch (_a) {
        }
    }
    return function (store) {
        const sessionData = window.sessionStorage.getItem("vuex");
        if (sessionData) {
            try {
                const parsedData = JSON.parse(sessionData);
                if (isObject(parsedData)) {
                    const data = key ? set({}, key, parsedData) : parsedData;
                    store.replaceState(merge(store.state, data));
                }
            }
            catch (_a) {
            }
        }
        store.subscribe(doSubscribe);
    };
}
//# sourceMappingURL=vuex-session.js.map