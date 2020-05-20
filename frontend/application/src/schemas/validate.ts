/**
 * @todo replace with djv (smaller package) once the 'additionalProperties' bug will be solved
 * @see https://github.com/korzio/djv/issues/46
 */

import Ajv from "ajv";

export default function extend<T>(schema: any): (arg0: T) => Promise<T> {
    const ajv = new Ajv();

    return async function(data: T): Promise<T> {
        const valid = ajv.validate(schema, data);

        if (!valid) {
            throw new Error(ajv.errorsText(ajv.errors));
        }

        return data;
    };
}
