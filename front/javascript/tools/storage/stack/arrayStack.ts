import {Stack} from "./listStack";

export default function<Type>(): Stack<Type> {

    const container: Type[] = [];
    const push = function(value: Type): Stack<Type> {

        container.push(value);

        return this;
    };
    const pop = (): Type => container.pop();
    const top = (): Type => container[container.length - 1];
    const size = (): number => container.length;

    return {

        push,
        pop,
        size,
        top,
    };
}
