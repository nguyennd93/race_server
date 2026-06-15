import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { AppModule } from './app.module';
import { RaceRoom } from './realtime/race.room';

async function bootstrap() {
  // REST API (NestJS) trên cổng 3000
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 REST API: http://localhost:${port}`);

  // Colyseus realtime — server + cổng riêng (cùng tiến trình), tự phục vụ matchmaking
  const gameServer = new Server({ transport: new WebSocketTransport() });
  gameServer.define('race', RaceRoom);
  const gamePort = Number(process.env.GAME_PORT ?? 2567);
  await gameServer.listen(gamePort);
  console.log(`🎮 Colyseus: ws://localhost:${gamePort}`);
}
bootstrap();
