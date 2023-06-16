import { Module, forwardRef } from '@nestjs/common';
import { SquidSubscriptionDataProvider } from './providers/squidSubscription.provider';
import { NotificationModule } from '../notification/notification.module';
import { ApiProviders } from '../../providers/api.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettings } from '../notificationSettings/typeorm/notificationSettings.entity';
import { SquidDataSubscriptionStatus } from './typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from './services/dataProviders.service';

@Module({
  providers: [
    SquidSubscriptionDataProvider,
    DataProvidersService,
    ...ApiProviders
  ],
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([SquidDataSubscriptionStatus])
  ],
  exports: [SquidSubscriptionDataProvider]
})
export class DataProvidersModule {}
