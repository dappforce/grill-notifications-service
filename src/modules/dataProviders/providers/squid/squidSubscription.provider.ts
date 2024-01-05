import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client as GraphqlWsClient } from 'graphql-ws';
import { NotificationService } from '../../../notification/services/notification.service';
import {
  SquidContentExtensionSchemaId,
  SquidActivitiesResponseDto,
  SquidNotificationsResponseDto,
  SquidSubscriptionNotificationsResponseDto,
  SquidSubscriptionsActivitiesResponseDto,
  SquidSubscriptionBatchNotificationsResponseDto
} from '../../dto/squid/squidResponse.dto';
import { SquidApiQueryName } from '../../typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from '../../services/dataProviders.service';
import { EventName } from '../../dto/squid/squidEvents.dto';
import { newLogger } from '@subsocial/utils';
import {
  squidSubQueryNotificationsShort,
  getSquidQueryNotificationsFull,
  squidSubQueryBatchNotifications
} from './queries';
import { SquidHelper } from './squid.helper';

@Injectable()
export class SquidSubscriptionDataProvider implements OnApplicationBootstrap {
  private logger = newLogger('Squid Subscription Data Provider');
  
  constructor(
    @Inject('GraphqlWsClient') private graphqlWsClient: GraphqlWsClient,
    private notificationService: NotificationService,
    public dataProvidersService: DataProvidersService,
    public squidHelper: SquidHelper
  ) {}

  onApplicationBootstrap(): any {
    this.subscribeToNotifications();
  }

  subscribeToNotifications() {
    this.graphqlWsClient.subscribe(
      {
        query: squidSubQueryBatchNotifications
      },
      {
        next: async (data) => {
          this.logger.info(`New squid status:`);

          this.logger.info('RAW subscription data :: data >>> ');
          console.dir(data.data, { depth: null });

          const notProcessedSubData = (await this.filterSubscriptionData(
            SquidApiQueryName.inBatchNotifications,
            <Array<SquidSubscriptionBatchNotificationsResponseDto>>(
              data.data.inBatchNotifications
            )
          )) as Array<SquidSubscriptionBatchNotificationsResponseDto>;

          console.log(
            'notProcessedSubData.length - ',
            notProcessedSubData.length
          );

          if (notProcessedSubData.length === 0) return;

          const mergedNotificationIds = notProcessedSubData
            .map((batchData) => batchData.activityIds)
            .flat();

          console.log('mergedNotificationIds - ', mergedNotificationIds);

          const fullData = await this.squidHelper.runSquidApiQuery<
            SquidApiQueryName.notifications,
            SquidNotificationsResponseDto
          >(getSquidQueryNotificationsFull(mergedNotificationIds));

          const notProcessedSubDataWithoutWrappers =
            this.filterSubDataNotificationsByContentExtensionWrappers(
              fullData.notifications
            );

          this.logger.info(
            'filtered subscription data by blockNumber without wrappers :: length - ',
            notProcessedSubDataWithoutWrappers.length
          );

          if (notProcessedSubDataWithoutWrappers.length === 0) return;

          await this.handleNewSubDataNotifications(
            notProcessedSubDataWithoutWrappers
          );
          await this.dataProvidersService.updateStatusByQueryName({
            name: SquidApiQueryName.inBatchNotifications,
            lastProcessedBlockNumber: Number.parseInt(
              notProcessedSubDataWithoutWrappers[0].activity.blockNumber
            )
          });
        },
        error: (error) => {
          this.logger.error('error', error);
          console.dir(error, { depth: null });
        },
        complete: () => {
          this.logger.info('done!');
        }
      }
    );
  }

  /**
   * Filters received data from squid by blockNumber and lastProcessedBlockNumber. Returns only that items which
   * still are not processed by Notifications service. "lastProcessedBlockNumber" pointer will be updated after
   * processing of current bunch of received subscription data.
   *
   * @param subQueryName
   * @param subscriptionEntitiesList
   */
  async filterSubscriptionData<Q extends SquidApiQueryName>(
    subQueryName: Q,
    subscriptionEntitiesList: Array<
      | SquidSubscriptionNotificationsResponseDto
      | SquidSubscriptionsActivitiesResponseDto
      | SquidSubscriptionBatchNotificationsResponseDto
    >
  ) {
    const subscriptionStatusData =
      await this.dataProvidersService.getOrCreateStatusByQueryName({
        name: subQueryName
      });

    switch (subQueryName) {
      case SquidApiQueryName.activities:
        return (<Array<SquidActivitiesResponseDto>>(
          subscriptionEntitiesList
        )).filter(
          (activity) =>
            Number.parseInt(activity.blockNumber) >
            subscriptionStatusData.lastProcessedBlockNumber
        );
        break;

      case SquidApiQueryName.notifications:
        return (<Array<SquidNotificationsResponseDto>>(
          subscriptionEntitiesList
        )).filter(
          (notification) =>
            Number.parseInt(notification.activity.blockNumber) >
            subscriptionStatusData.lastProcessedBlockNumber
        );
        break;
      case SquidApiQueryName.inBatchNotifications:
        return (<Array<SquidSubscriptionBatchNotificationsResponseDto>>(
          subscriptionEntitiesList
        )).filter(
          (inBatchNotifications) =>
            Number.parseInt(inBatchNotifications.batchStartBlockNumber) >
            subscriptionStatusData.lastProcessedBlockNumber
        );
        break;
      default:
    }
  }

  async handleNewSubDataNotifications(
    notifications: Array<SquidNotificationsResponseDto>
  ) {
    for (const squidNotification of notifications) {
      const { activity, account, id } = squidNotification;
      switch (squidNotification.activity.event) {
        case EventName.CommentReplyCreated:
          await this.notificationService.handleNotificationEventForSubstrateAccount(
            {
              eventName: activity.event,
              substrateAccountId: account.id,
              post: activity.post
            }
          );
          break;

        case EventName.ExtensionDonationCreated:
          await this.notificationService.handleNotificationEventForSubstrateAccount(
            {
              eventName: activity.event,
              substrateAccountId: account.id,
              post: activity.post,
              extension: activity.extension
            }
          );
          break;

        default:
      }
    }
  }

  /**
   * Removes Notifications from received list if it's "PostCreated || CommentCreated || CommentReplyCreated" event and
   * Post entity contains ContentExtension, which has its own Squid event (subsocial_donations || subsocial_evm_nft).
   * Such Post is sort of wrapper/container for ContentExtension and its creation event is redundant in context of
   * Notifications service.
   *
   * @param notifications
   */
  filterSubDataNotificationsByContentExtensionWrappers(
    notifications: Array<SquidNotificationsResponseDto>
  ) {
    const filteredNotifications: Array<SquidNotificationsResponseDto> = [];

    for (const notificationData of notifications) {
      if (
        (notificationData.activity.event !== EventName.PostCreated &&
          notificationData.activity.event !== EventName.CommentCreated &&
          notificationData.activity.event !== EventName.CommentReplyCreated) ||
        !notificationData.activity.post
      ) {
        filteredNotifications.push(notificationData);
        continue;
      }

      const entityContentExtensionsForSkip = (
        notificationData.activity.post.extensions || []
      ).filter(
        (extension) =>
          extension.extensionSchemaId ===
            SquidContentExtensionSchemaId.subsocial_donations ||
          extension.extensionSchemaId ===
            SquidContentExtensionSchemaId.subsocial_evm_nft
      );

      if (entityContentExtensionsForSkip.length === 0) {
        filteredNotifications.push(notificationData);
        continue;
      }
    }

    return filteredNotifications;
  }
}
