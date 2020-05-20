var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
export default function serialize(form) {
    var e_1, _a;
    var inputs = form.querySelectorAll("input, textarea, select");
    var fields = {};
    try {
        for (var inputs_1 = __values(inputs), inputs_1_1 = inputs_1.next(); !inputs_1_1.done; inputs_1_1 = inputs_1.next()) {
            var input = inputs_1_1.value;
            if (input.name &&
                !input.disabled &&
                input.type !== "file" &&
                input.type !== "reset" &&
                input.type !== "submit" &&
                input.type !== "button") {
                if (input.type !== "checkbox" &&
                    input.type !== "radio" &&
                    input.type !== "select") {
                    fields[input.name] = input.value;
                }
                else if ((input.type === "checkbox" || input.type === "radio") &&
                    input.checked) {
                    fields[input.name] = input.value;
                }
                else if (input.type === "select") {
                    fields[input.name] = __spread(input.selectedOptions).map(function (el) { return el.innerText; })
                        .join(", ");
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (inputs_1_1 && !inputs_1_1.done && (_a = inputs_1.return)) _a.call(inputs_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return fields;
}
//# sourceMappingURL=form-serialize.js.map