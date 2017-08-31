export default function<Type>(object: any): () => Type {

    let stored: Type;

    return (...args: any[]): Type => {

        if (!stored) {

            stored = object.constructor === Function ? object(...args) : object;
        }

        return stored;
    };
}
