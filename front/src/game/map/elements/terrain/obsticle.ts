export interface Obstacle {

    type: string,
    defense: number
}

export default function(type: string, defense: number): Obstacle {

	return {

		type: type,
		defense: defense
	};
};