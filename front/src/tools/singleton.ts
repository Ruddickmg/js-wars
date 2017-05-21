/**
 * Created by moonmaster on 5/12/17.
 */

export default function<Type>(object: any): () => Type {

    let stored: Type;

    return (...args: any[]): Type => {

        if (!stored) {

            stored = object(...args);
        }

        return stored;
    };
}
