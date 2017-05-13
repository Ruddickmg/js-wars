import obstacle from "./obsticle";

export default {

    mountain: obstacle('mountain', 2),
    wood: obstacle('wood', 3),
    building: obstacle('building', 2),
    plain: obstacle('plain', 1),
    snow: obstacle('snow', 1),
    unit: obstacle('unit', 0)
}