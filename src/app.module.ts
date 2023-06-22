import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './middleware/session.middleware';
import { commandWithArgsMiddleware } from './middleware/commandWithArgs.middleware';
import { GrillNotificationsBotName } from './app.constants';
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
import { GraphQLError, GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    EnvModule,
    TelegrafModule.forRootAsync({
      inject: [xSocialConfig],
      botName: GrillNotificationsBotName,
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
      context: ({ req }) => ({ headers: req.headers }),
      // @ts-ignore
      // formatError: (error: GraphQLError, en) => {
      //   // console.dir(en, {depth: null})
      //   const graphQLFormattedError: GraphQLFormattedError = {
      //     message:
      //     // @ts-ignore
      //       error?.extensions?.exception?.response?.message || error?.message
      //   };
      //   return graphQLFormattedError;
      // }
    }),
    TypeOrmModule.forRootAsync({
      inject: [xSocialConfig],
      useFactory: (env: xSocialConfig) => ({
        type: 'mongodb',
        url: env.MONGODB_URL,
        synchronize: false,
        useUnifiedTopology: true,
        entities: [
          NotificationSettings,
          AccountsLink,
          TelegramAccount,
          TelegramTemporaryLinkingId,
          SquidDataSubscriptionStatus
        ]
      })
    }),
    NotificationSettingsModule,
    AccountsLinkModule,
    NotificationModule,
    TelegramBotModule,
    DataProvidersModule
  ]
})
export class AppModule {}
