import { INestApplication } from '@nestjs/common';
import { TelegrafExceptionFilter } from './common/filters/telegraf-exception.filter';
import { GraphqlExceptionFilter } from './common/filters/graphql-exception.filter';

export function mainConfig(app: INestApplication) {
  app.useGlobalFilters(new TelegrafExceptionFilter());
  app.useGlobalFilters(new GraphqlExceptionFilter());
  app.enableCors({ origin: '*' });
}
