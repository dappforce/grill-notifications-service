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
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
    private commonNotificationSendersHelper: CommonNotificationSendersHelper
  ) {}

  async sendMessageFcm(
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    if (
      !notificationRecipientData.fcmTokens ||
      notificationRecipientData.fcmTokens.length === 0
    )
      return;

    switch (triggerData.eventName) {
      case EventName.CommentReplyCreated: {
        let checkUrl =
          this.commonNotificationSendersHelper.createPostUrlFromNotificationTriggerData(
            triggerData
          );

        const msgData = {
          postId: triggerData.post.id,
          rootPostId: triggerData.post.rootPost.id,
          parentPostId: triggerData.post.parentPost.id,
          spaceId: triggerData.post.rootPost.space.id
        };

        const message = {
          notification: { title: 'New reply!', body: triggerData.post.summary },
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
            data: msgData
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

      case EventName.ExtensionDonationCreated: {
        let checkUrl =
          this.commonNotificationSendersHelper.createPostUrlFromNotificationTriggerData(
            triggerData
          );
        const msgData = {
          postId: triggerData.post.id,
          rootPostId: triggerData.post.rootPost.id,
          parentPostId: triggerData.post.parentPost.id,
          spaceId: triggerData.post.rootPost.space.id
        };

        const message = {
          notification: { title: 'New reply!', body: triggerData.post.summary },
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
            data: msgData
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
