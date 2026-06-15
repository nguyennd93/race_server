import { Room, Client } from 'colyseus';
import * as jwt from 'jsonwebtoken';
import { RaceState } from './schema/race-state';
import { Player } from './schema/player';

interface AuthData {
  userId: string;
}

/**
 * Phòng đua PvP realtime.
 * - onAuth: verify JWT (chung JWT_SECRET với REST API) -> lấy userId.
 * - matchmaking: client joinOrCreate("race").
 * - presence: đồng bộ danh sách người chơi + trạng thái ready.
 * - đủ >=2 người và tất cả ready -> đếm ngược -> racing.
 */
export class RaceRoom extends Room<{ state: RaceState }> {
  maxClients = 4;
  private readonly MIN_PLAYERS = 2;
  private countdownInterval: any;

  onCreate() {
    this.setState(new RaceState());

    this.onMessage('ready', (client, ready: boolean) => {
      const p = this.state.players.get(client.sessionId);
      if (!p || this.state.phase !== 'waiting') return;
      p.ready = ready;
      this.tryStartCountdown();
    });

    // Đồng bộ vị trí + góc xoay xe
    this.onMessage('position', (client, msg: { x: number; y: number; z: number; ry: number }) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.x = msg.x;
      p.y = msg.y;
      p.z = msg.z;
      p.ry = msg.ry;
    });

    this.onMessage('finish', (client, timeMs: number) => {
      const p = this.state.players.get(client.sessionId);
      if (!p || p.finished) return;
      p.finished = true;
      p.finishTime = timeMs;
      this.checkAllFinished();
    });
  }

  async onAuth(client: Client, options: any): Promise<AuthData> {
    const token = options?.token;
    if (!token) throw new Error('Thiếu token');
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Server thiếu JWT_SECRET');

    const payload = jwt.verify(token, secret) as { sub: string };
    return { userId: payload.sub };
  }

  onJoin(client: Client, options: any, auth: AuthData) {
    // Gán spawnIndex nhỏ nhất còn trống (0..maxClients-1) để xe không đè nhau
    const used = new Set<number>();
    this.state.players.forEach((pl) => used.add(pl.spawnIndex));
    let spawnIndex = 0;
    while (used.has(spawnIndex)) spawnIndex++;

    const p = new Player();
    p.userId = auth.userId;
    p.displayName = options?.displayName || 'Racer';
    p.spawnIndex = spawnIndex;
    this.state.players.set(client.sessionId, p);
    console.log(`[RaceRoom] ${p.displayName} joined (${client.sessionId}). Tổng: ${this.state.players.size}`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    console.log(`[RaceRoom] ${client.sessionId} left. Còn: ${this.state.players.size}`);
  }

  private tryStartCountdown() {
    const players = Array.from(this.state.players.values());
    if (players.length >= this.MIN_PLAYERS && players.every((p) => p.ready)) {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.state.phase = 'countdown';
    this.state.countdown = 3;
    this.lock(); // khóa, không nhận người mới trong lúc đếm ngược/đua

    this.countdownInterval = this.clock.setInterval(() => {
      this.state.countdown -= 1;
      if (this.state.countdown <= 0) {
        this.countdownInterval?.clear();
        this.state.phase = 'racing';
        console.log('[RaceRoom] Bắt đầu đua!');
      }
    }, 1000);
  }

  private checkAllFinished() {
    const players = Array.from(this.state.players.values());
    if (players.length > 0 && players.every((p) => p.finished)) {
      this.state.phase = 'finished';
      console.log('[RaceRoom] Trận kết thúc.');
      // TODO: lưu kết quả vào DB (gọi MatchesService / POST /matches) ở bước sau.
    }
  }
}
