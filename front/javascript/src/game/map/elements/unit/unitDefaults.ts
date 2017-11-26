export interface UnitDefaults {

  ammo(): number;
  fuel(): number;
  health(): number;
  movement(): number;
  vision(): number;
}

export default function(properties: any): UnitDefaults {

  const ammo: number = properties.ammo;
  const fuel: number = properties.fuel;
  const movement: number = properties.movement;
  const vision: number = properties.vision;
  const defaultHealth: number = 100;

  [ammo, fuel, movement, vision, defaultHealth].forEach((property: number) => {

    if (isNaN(property)) {

      throw new Error("One of the default properties is not defined.");
    }
  });

  return {

    ammo: (): number => ammo,
    fuel: (): number => fuel,
    health: (): number => defaultHealth,
    movement: (): number => movement,
    vision: (): number => vision,
  };
}
