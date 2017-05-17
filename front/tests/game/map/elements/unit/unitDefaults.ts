export default function(properties) {

	const
        ammo: number = properties.ammo,
        fuel: number = properties.fuel,
        movement: number = properties.movement,
        vision: number = properties.vision,
        defaultHealth: number = 100;

    [ammo, fuel, movement, vision, defaultHealth].forEach((property) => {

        if (isNaN(property)) {

            throw new Error("One of the default properties is not defined.");
        }
    });

	return {
		ammo:() => ammo,
		fuel:() => fuel,
		movement:() => movement,
		vision:() => vision,
		health: () => defaultHealth
	};
};