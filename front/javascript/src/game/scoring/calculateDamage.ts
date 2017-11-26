import {Unit} from "../map/elements/unit/unit";

export default function(attacked: Unit, attacker: Unit) {

  const abs: any = Math.abs;
  const healthScale: number = 10;
  const defenseScale: number = 200;
  const percentageDivisor: number = 100;
  const randomNumber = Math.floor((Math.random() * 9) + 1);

  const toPercent = (amount: number) => (amount / percentageDivisor);
  const nameOfAttackedUnit = attacked.name.toLowerCase();
  const mapOfDamageBasedOnUnitTypes = attacker.baseDamage();

  const coAttackBoost = attacker.player().co.attack(attacker);
  const coDefenseBoost = attacked.player().co.defense(attacked);
  const terrainDefenseBoost = attacked.occupies().defense() || 1;

  const healthOfAttacker = (attacker.health / healthScale);
  const healthOfDefender = attacked.health;

  const damage = mapOfDamageBasedOnUnitTypes[nameOfAttackedUnit] + coAttackBoost;
  const defense = healthOfDefender + coDefenseBoost + terrainDefenseBoost;

  const totalDamage = abs(toPercent(damage) + randomNumber);
  const totalDefense = abs(toPercent(defenseScale - defense));

  return Math.round(healthOfAttacker * totalDamage * totalDefense);
}
