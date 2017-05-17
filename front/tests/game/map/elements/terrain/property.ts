import {Obstacle} from "./obsticle";

export interface Property extends Obstacle {

    name: string
}

export default function(name: string, obstacle: Obstacle): Property {

	return {
		type: obstacle.type,
		defense: obstacle.defense,
	    name: name
	};
};