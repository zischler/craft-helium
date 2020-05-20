/**
 * Serialize a Form
 * @param {HTMLFormElement} form
 * @returns {*}
 * @todo select elements
 */
export default function serialize(form: HTMLFormElement) {
    const inputs = form.querySelectorAll(
        "input, textarea, select",
    ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    const fields = {};

    for (const input of inputs) {
        if (
            input.name &&
            !input.disabled &&
            input.type !== "file" &&
            input.type !== "reset" &&
            input.type !== "submit" &&
            input.type !== "button"
        ) {
            if (
                input.type !== "checkbox" &&
                input.type !== "radio" &&
                input.type !== "select"
            ) {
                fields[input.name] = input.value;
            } else if (
                (input.type === "checkbox" || input.type === "radio") &&
                (input as HTMLInputElement).checked
            ) {
                fields[input.name] = input.value;
            } else if (input.type === "select") {
                fields[input.name] = [
                    ...(input as HTMLSelectElement).selectedOptions,
                ]
                    .map(el => el.innerText)
                    .join(", ");
            }
        }
    }

    return fields;
}
