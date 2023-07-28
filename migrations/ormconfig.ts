import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export function getConfig() {
  return {
    type: 'mongodb',
    useUnifiedTopology: true,
    url: process.env.MONGODB_URL,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/*.migration.ts'],
    migrationsTableName: 'grill_notifications_migrations'
  } as DataSourceOptions;
}
