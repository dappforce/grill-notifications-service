import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TelegrafExceptionFilter } from './common/filters/telegraf-exception.filter';
import { UserInputError, ValidationError } from '@nestjs/apollo';

export function mainConfig(app: INestApplication) {
  app.useGlobalFilters(new TelegrafExceptionFilter());

  app.enableCors({ origin: '*' });
}
