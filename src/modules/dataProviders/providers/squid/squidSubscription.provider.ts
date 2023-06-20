import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client as GraphqlWsClient } from 'graphql-ws';
import { NotificationService } from '../../../notification/services/notification.service';
import {
  SquidContentExtensionSchemaId,
  SquidSubscriptionActivitiesResponseDto,
  SquidSubscriptionNotificationsResponseDto,
  SquidSubscriptionResponseDto
} from '../../dto/squid/squidSubscriptionResponse.dto';
import { SquidApiSubscriptionQueryName } from '../../typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from '../../services/dataProviders.service';
import { EventName } from '../../dto/squid/squidEvents.dto';
import { squidSubQueryNotifications } from './queries';

@Injectable()
export class SquidSubscriptionDataProvider implements OnApplicationBootstrap {
  constructor(
    @Inject('GraphqlWsClient') private graphqlWsClient: GraphqlWsClient,
    private notificationService: NotificationService,
    public dataProvidersService: DataProvidersService
  ) {}
  onApplicationBootstrap(): any {
    this.subscribeToNotifications();
  }

  subscribeToNotifications() {
    this.graphqlWsClient.subscribe(
      {
        query: squidSubQueryNotifications
      },
      {
        next: async (data) => {
          console.log(`New squid status:`);
          const notProcessedSubData = (await this.filterSubscriptionData(
            SquidApiSubscriptionQueryName.notifications,
            <Array<SquidSubscriptionNotificationsResponseDto>>(
              data.data.notifications
            )
          )) as Array<SquidSubscriptionNotificationsResponseDto>;
          console.log(
            'RAW subscription data :: length - ',
            (<Array<SquidSubscriptionNotificationsResponseDto>>(
              data.data.notifications
            )).length
          );
          console.log(
            'filtered subscription data by blockNumber :: length - ',
            notProcessedSubData.length
          );
          if (notProcessedSubData.length === 0) return;

          const notProcessedSubDataWithoutWrappers =
            this.filterSubDataNotificationsByContentExtensionWrappers(
              notProcessedSubData
            );
          console.log(
            'filtered subscription data by blockNumber without wrappers :: length - ',
            notProcessedSubDataWithoutWrappers.length
          );
          if (notProcessedSubDataWithoutWrappers.length === 0) return;

          await this.handleNewSubDataNotifications(
            notProcessedSubDataWithoutWrappers
          );
          await this.dataProvidersService.updateStatusByQueryName({
            name: SquidApiSubscriptionQueryName.notifications,
            lastProcessedBlockNumber: Number.parseInt(
              notProcessedSubDataWithoutWrappers[0].activity.blockNumber
            )
          });
        },
        error: (error) => {
          console.error('error', error);
          console.dir(error, { depth: null });
        },
        complete: () => {
          console.log('done!');
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
  async filterSubscriptionData<Q extends SquidApiSubscriptionQueryName>(
    subQueryName: Q,
    subscriptionEntitiesList: Array<
      | SquidSubscriptionNotificationsResponseDto
      | SquidSubscriptionActivitiesResponseDto
    >
  ) {
    const subscriptionStatusData =
      await this.dataProvidersService.getOrCreateStatusByQueryName({
        name: subQueryName
      });

    switch (subQueryName) {
      case SquidApiSubscriptionQueryName.activities:
        return (<Array<SquidSubscriptionActivitiesResponseDto>>(
          subscriptionEntitiesList
        )).filter(
          (activity) =>
            Number.parseInt(activity.blockNumber) >
            subscriptionStatusData.lastProcessedBlockNumber
        );
        break;
      case SquidApiSubscriptionQueryName.notifications:
        return (<Array<SquidSubscriptionNotificationsResponseDto>>(
          subscriptionEntitiesList
        )).filter(
          (notification) =>
            Number.parseInt(notification.activity.blockNumber) >
            subscriptionStatusData.lastProcessedBlockNumber
        );
        break;
      default:
    }
  }

  async handleNewSubDataNotifications(
    notifications: Array<SquidSubscriptionNotificationsResponseDto>
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
    notifications: Array<SquidSubscriptionNotificationsResponseDto>
  ) {
    const filteredNotifications: Array<SquidSubscriptionNotificationsResponseDto> =
      [];

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
