import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GrillNotificationsBotName } from '../../../app.constants';
import { Markup, Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { AccountNotificationData } from '../dto/types';
import { EventName } from '../../dataProviders/dto/squid/squidEvents.dto';
import { CommonUtils } from '../../../common/utils/common.util';
import { InlineKeyboardMarkup } from 'typegram';
import { xSocialConfig } from '../../../config';

@Injectable()
export class CommonNotificationSendersHelper {
  constructor(
    @InjectBot(GrillNotificationsBotName)
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
}
