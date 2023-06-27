import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GRILL_NOTIFICATIONS_BOT_NAME } from '../../../app.constants';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { CommonUtils } from '../../../common/utils/common.util';
import { xSocialConfig } from '../../../config';

@Injectable()
export class CommonNotificationSendersHelper {
  constructor(
    @InjectBot(GRILL_NOTIFICATIONS_BOT_NAME)
    private bot: Telegraf<TelegrafContext>,
    private commonUtils: CommonUtils,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  createTxExplorerUrlForDonation(
    txHash: string,
    network: string
  ): string | null {
    if (!txHash && !network) return null;

    switch (network) {
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'moonriver':
        return `https://moonriver.moonscan.io/tx/${txHash}`;
      case 'moonbeam':
        return `https://moonbeam.moonscan.io/tx/${txHash}`;
      default:
        return null;
    }
  }

  createPostUrlFromNotificationTriggerData(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ): string | undefined {
    try {
      return `${this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF}/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`;
    } catch (e) {
      return undefined;
    }
  }
}
