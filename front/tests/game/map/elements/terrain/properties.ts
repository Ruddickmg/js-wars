import createProperty from './property.js';
import obstacles from './obsticles';

export default {

    tallMountain: createProperty('Mountain', obstacles.mountain),
    tree: createProperty('Woods', obstacles.wood),
    hq: createProperty('HQ', obstacles.building),
    base: createProperty('Base', obstacles.building),
    plain: createProperty('Plains', obstacles.plain),
    unit: createProperty('Unit', obstacles.unit),
    snow: createProperty('Snow', obstacles.snow)
};