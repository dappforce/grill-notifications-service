import { Module } from '@nestjs/common';
import { SquidSubscriptionDataProvider } from './providers/squid/squidSubscription.provider';
import { NotificationModule } from '../notification/notification.module';
import { ApiProviders } from '../../providers/api.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SquidDataSubscriptionStatus } from './typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from './services/dataProviders.service';
import { SquidHelper } from './providers/squid/squid.helper';

@Module({
  providers: [
    SquidSubscriptionDataProvider,
    DataProvidersService,
    SquidHelper,
    ...ApiProviders
  ],
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([SquidDataSubscriptionStatus])
  ],
  exports: [SquidSubscriptionDataProvider]
})
export class DataProvidersModule {}
