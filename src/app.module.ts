import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './middleware/session.middleware';
import { commandWithArgsMiddleware } from './middleware/commandWithArgs.middleware';
import { GRILL_NOTIFICATIONS_BOT_NAME } from './app.constants';
import { TelegramBotModule } from './modules/tgBot/telegramBot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { EnvModule, xSocialConfig } from './config';
import { AccountsLinkModule } from './modules/accountsLink/accountsLink.module';
import { NotificationSettingsModule } from './modules/notificationSettings/notificationSettings.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationSettings } from './modules/notificationSettings/typeorm/notificationSettings.entity';
import { AccountsLink } from './modules/accountsLink/typeorm/accountsLink.entity';
import { DataProvidersModule } from './modules/dataProviders/dataProviders.module';
import { SquidDataSubscriptionStatus } from './modules/dataProviders/typeorm/squidDataSubscriptionStatus';
import { TelegramAccount } from './modules/accountsLink/typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from './modules/accountsLink/typeorm/telegramTemporaryLinkingId.entity';
import { SignatureNonceModule } from './modules/signatureNonce/signatureNonce.module';
import { SignatureNonce } from './modules/signatureNonce/typeorm/signatureNonce.entity';
import { RobotTxtMiddleware } from './middleware/robotTxt.middleware';

@Module({
  imports: [
    EnvModule,
    TelegrafModule.forRootAsync({
      inject: [xSocialConfig],
      botName: GRILL_NOTIFICATIONS_BOT_NAME,
      useFactory: (env: xSocialConfig) => {
        return {
          token: env.NOTIFICATIONS_BOT_TOKEN,
          middlewares: [sessionMiddleware, commandWithArgsMiddleware],
          include: [TelegramBotModule]
        };
      }
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: './src/schema.gql',
      driver: ApolloDriver,
      playground: true,
      context: ({ req }) => ({ headers: req.headers })
    }),
    TypeOrmModule.forRootAsync({
      inject: [xSocialConfig],
      useFactory: (env: xSocialConfig) => ({
        type: 'mongodb',
        url: env.MONGODB_URL,
        synchronize: false,
        useUnifiedTopology: true,
        entities: [
          TelegramTemporaryLinkingId,
          SquidDataSubscriptionStatus,
          NotificationSettings,
          TelegramAccount,
          SignatureNonce,
          AccountsLink
        ]
      })
    }),
    SignatureNonceModule,
    NotificationSettingsModule,
    AccountsLinkModule,
    NotificationModule,
    TelegramBotModule,
    DataProvidersModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RobotTxtMiddleware)
      .forRoutes({ path: 'robot.txt', method: RequestMethod.GET });
  }
}
