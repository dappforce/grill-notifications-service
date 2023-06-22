import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { transformAndValidateSync } from 'class-transformer-validator';
import { IsNotEmpty } from 'class-validator';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env.local` });

export class xSocialConfig {
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
  readonly TELEGRAM_BOT_GRILL_REDIRECTION_HREF: string;
  @IsNotEmpty()
  readonly TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_STR: string;

  public API_NO_ADMIN_PROTECTION_STR: string;

  public API_NO_ADMIN_PROTECTION = false;

  public TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS = 10;
}

@Global()
@Module({
  providers: [
    {
      provide: xSocialConfig,
      useFactory: () => {
        const env = transformAndValidateSync(xSocialConfig, process.env);
        const telegramTemporaryLinkingIdExpirationTimeMinsStr = Number.parseInt(
          env.TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS_STR || '10'
        );
        env.API_NO_ADMIN_PROTECTION =
          env.API_NO_ADMIN_PROTECTION_STR === 'true' || false;
        env.TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS = !Number.isNaN(
          telegramTemporaryLinkingIdExpirationTimeMinsStr
        )
          ? telegramTemporaryLinkingIdExpirationTimeMinsStr
          : 10;
        return env;
      }
    }
  ],
  exports: [xSocialConfig]
})
export class EnvModule {}
