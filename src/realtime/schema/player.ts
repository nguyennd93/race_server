import { Schema, type } from '@colyseus/schema';

/**
 * State của 1 người chơi trong RaceRoom — được Colyseus tự đồng bộ tới mọi client.
 */
export class Player extends Schema {
  @type('string') userId = '';
  @type('string') displayName = 'Racer';
  @type('boolean') ready = false;
  @type('number') spawnIndex = 0; // vị trí xuất phát (0,1,2,3) để xe không đè nhau

  // Vị trí + góc xoay (yaw) xe để đồng bộ realtime
  @type('number') x = 0;
  @type('number') y = 0;
  @type('number') z = 0;
  @type('number') ry = 0;

  @type('boolean') finished = false;
  @type('number') finishTime = 0;
}
