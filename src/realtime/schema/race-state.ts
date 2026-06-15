import { Schema, type, MapSchema } from '@colyseus/schema';
import { Player } from './player';

/**
 * State của RaceRoom. phase điều khiển vòng đời trận:
 * waiting → countdown → racing → finished.
 */
export class RaceState extends Schema {
  @type('string') phase = 'waiting';
  @type('number') countdown = 0;
  @type({ map: Player }) players = new MapSchema<Player>();
}
