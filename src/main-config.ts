import { INestApplication } from '@nestjs/common';
import { TelegrafExceptionFilter } from './common/filters/telegraf-exception.filter';

export function mainConfig(app: INestApplication) {
  app.useGlobalFilters(new TelegrafExceptionFilter());

  app.enableCors({ origin: '*' });
}
