/**
 * Created by moonmaster on 5/17/17.
 */

export interface Dimensions {

    width: number;
    height: number;
}

export default function(width: number, height: number): Dimensions {

    return {
        width,
        height,
    };
}
