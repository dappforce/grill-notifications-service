import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettingsGqlResolver } from './graphql/notificationSettings.gql.resolver';
import { NotificationSettingsService } from './services/notificationSettings.service';
import { NotificationSettings } from './typeorm/notificationSettings.entity';

@Module({
  providers: [NotificationSettingsService, NotificationSettingsGqlResolver],
  imports: [TypeOrmModule.forFeature([NotificationSettings])],
  exports: [NotificationSettingsService]
})
export class NotificationSettingsModule {}
