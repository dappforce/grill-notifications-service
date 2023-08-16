import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GRILL_NOTIFICATIONS_BOT_NAME } from '../../../app.constants';
import { Markup, Telegraf, Format } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { AccountNotificationData } from '../dto/types';
import { EventName } from '../../dataProviders/dto/squid/squidEvents.dto';
import { CommonUtils } from '../../../common/utils/common.util';
import { InlineKeyboardMarkup } from 'typegram';
import { xSocialConfig } from '../../../config';
import { CommonNotificationSendersHelper } from './commonNotificationSenders.helper';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class FcmSendersHelper {
  constructor(
    private commonUtils: CommonUtils,
    private cryptoUtils: CryptoUtils,
    private readonly xSocialConfig: xSocialConfig,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private commonNotificationSendersHelper: CommonNotificationSendersHelper
  ) {}

  async sendMessageFcm(
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    console.log('triggerData >>>');

    console.dir(triggerData, { depth: null });
    if (
      !notificationRecipientData.fcmTokens ||
      notificationRecipientData.fcmTokens.length === 0
    )
      return;

    const checkUrl =
      this.commonNotificationSendersHelper.createPostUrlFromNotificationTriggerData(
        triggerData,
        notificationRecipientData.substrateAccountId
      );

    switch (triggerData.eventName) {
      case EventName.CommentReplyCreated: {
        const msgData = {
          postId: triggerData.post.id,
          rootPostId: triggerData.post.rootPost.id,
          parentPostId: triggerData.post.parentPost.id,
          spaceId: triggerData.post.rootPost.space.id
        };

        const notificationData = {
          title: `New Reply in ${triggerData.post.rootPost.title}`,
          body: triggerData.post.summary,
          imageUrl: this.xSocialConfig.FCM_MESSAGE_IMG_URL
        };

        const message = {
          notification: notificationData,
          data: msgData,
          android: {
            priority: 'high',
            data: msgData
          },
          apns: {
            headers: {
              'apns-priority': '10'
            }
          },
          webpush: {
            headers: {
              Urgency: 'high'
            },
            data: msgData,
            notification: {
              ...notificationData,
              icon: this.xSocialConfig.FCM_MESSAGE_IMG_URL,
              image: this.xSocialConfig.FCM_MESSAGE_IMG_URL,
              badge: this.xSocialConfig.FCM_MESSAGE_IMG_URL
            },
            fcmOptions: {
              link: checkUrl
            }
          },
          tokens: notificationRecipientData.fcmTokens || []
        };

        console.dir(message, { depth: null });

        const sendResp = await this.firebase.messaging.sendEachForMulticast(
          // @ts-ignore
          message
        );

        console.log('sendResp >>>');
        console.dir(sendResp, { depth: null });

        break;
      }

      case EventName.ExtensionDonationCreated: {
        const msgData = {
          postId: triggerData.post.id,
          rootPostId: triggerData.post.rootPost.id,
          parentPostId: triggerData.post.parentPost.id,
          spaceId: triggerData.post.rootPost.space.id
        };

        const notificationData = {
          title: `🤑 You received a donation of ${this.commonUtils.decorateDonationAmount(
            triggerData.extension.amount,
            triggerData.extension.decimals
          )} ${triggerData.extension.token}`,
          // body: triggerData.post.summary,
          imageUrl: this.xSocialConfig.FCM_MESSAGE_IMG_URL
        };

        const message = {
          notification: notificationData,
          data: msgData,
          android: {
            priority: 'high',
            data: msgData
          },
          apns: {
            headers: {
              'apns-priority': '10'
            }
          },
          webpush: {
            headers: {
              Urgency: 'high'
            },
            data: msgData,
            notification: {
              ...notificationData,
              icon: this.xSocialConfig.FCM_MESSAGE_IMG_URL,
              image: this.xSocialConfig.FCM_MESSAGE_IMG_URL,
              badge: this.xSocialConfig.FCM_MESSAGE_IMG_URL
            },
            fcmOptions: {
              link: checkUrl
            }
          },
          tokens: notificationRecipientData.fcmTokens || []
        };

        const sendResp = await this.firebase.messaging.sendEachForMulticast(
          // @ts-ignore
          message
        );

        console.log('sendResp >>>');
        console.dir(sendResp, { depth: null });

        break;
      }
      default:
    }
  }
}
