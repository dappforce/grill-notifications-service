import { Global, Module } from '@nestjs/common';
import { transformAndValidateSync } from 'class-transformer-validator';
import { IsNotEmpty } from 'class-validator';
import * as dotenv from 'dotenv';
import { CommonUtils } from './common/utils/common.util';
import { TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_DEFAULT } from './app.constants';
import { newLogger, Levels } from '@subsocial/utils';

dotenv.config({ path: `${__dirname}/../.env.local` });

export class xSocialConfig {
  @IsNotEmpty()
  readonly NODE_ENV: string;
  @IsNotEmpty()
  readonly XSOCIAL_RPC_URL: string;
  @IsNotEmpty()
  readonly IPFS_NODE_URL: string;
  @IsNotEmpty()
  readonly IPFS_ADMIN_NODE_URL: string;
  @IsNotEmpty()
  readonly NOTIFICATIONS_BOT_TOKEN: string;
  @IsNotEmpty()
  readonly MONGODB_URL: string;
  @IsNotEmpty()
  readonly GQL_API_AUTH_SECRET: string;
  @IsNotEmpty()
  readonly DATA_PROVIDER_SQUID_WS_URL: string;
  @IsNotEmpty()
  readonly DATA_PROVIDER_SQUID_HTTPS_URL: string;
  @IsNotEmpty()
  readonly TELEGRAM_BOT_GRILL_REDIRECTION_HREF: string;
  @IsNotEmpty()
  readonly FIREBASE_ADMIN_SDK_CREDS: string;
  @IsNotEmpty()
  readonly TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_STR: string;
  @IsNotEmpty()
  readonly FCM_MESSAGE_IMG_URL: string;

  readonly LOGGER_LEVEL: string;

  public API_NO_ADMIN_PROTECTION_STR: string;

  public API_NO_ADMIN_PROTECTION = false;

  public TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS =
    TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_DEFAULT;
}

@Global()
@Module({
  providers: [
    CommonUtils,
    {
      provide: xSocialConfig,
      inject: [CommonUtils],
      useFactory: (commonUtils: CommonUtils) => {
        const env = transformAndValidateSync(xSocialConfig, process.env);
        newLogger.setDefaultLevel((env.LOGGER_LEVEL as Levels) || 'INFO');
        env.API_NO_ADMIN_PROTECTION =
          env.API_NO_ADMIN_PROTECTION_STR === 'true' || false;
        env.TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS =
          commonUtils.parseToNumberOrDefault(
            env.TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_STR,
            TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_DEFAULT
          );
        return env;
      }
    }
  ],
  exports: [xSocialConfig]
})
export class EnvModule {}
