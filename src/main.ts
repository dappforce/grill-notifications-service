import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { mainConfig } from './main-config';
dotenv.config({ path: `${__dirname}/../.env.local` });

async function bootstrap() {
  // await NestFactory.createApplicationContext(AppModule);

  const app = await NestFactory.create(AppModule);

  mainConfig(app);

  await app.listen(process.env.BOT_PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
