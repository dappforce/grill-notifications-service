import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client as GraphqlWsClient } from 'graphql-ws';
import { NotificationService } from '../../notification/services/notification.service';
import {
  SquidSubscriptionActivitiesResponseDto,
  SquidSubscriptionNotificationsResponseDto,
  SquidSubscriptionResponseDto
} from '../dto/squid/squidSubscriptionResponse.dto';
import { SquidApiSubscriptionQueryName } from '../typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from '../services/dataProviders.service';
import { EventName } from '../dto/squid/squidEvents.dto';

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
        query: `
        subscription {
          notifications(limit: 500, orderBy: activity_blockNumber_DESC) {
            id
            account {
              id
            }
            activity {
              id
              blockNumber
              event
              account {
                id
              }
              extension {
                id
                nftId
                amount
                chain
                collectionId
                decimals
                extensionSchemaId
                token
                txHash
                url
                fromEvm {
                  id
                }
                fromSubstrate {
                  id
                }
                parentPost {
                  id
                  summary
                  body
                }
                toEvm {
                  id
                }
                toSubstrate {
                  id
                }
              }
              post {
                id
                body
                summary
                kind
                ownedByAccount {
                  id
                }
                space {
                  id
                }
                rootPost {
                  id
                  space {
                    id
                  }
                }
              }
            }
          }
        }
    `
      },
      {
        next: async (data) => {
          console.log(`New squid status:`);
          // console.dir(data, { depth: null });
          const filteredData = (await this.filterSubscriptionData(
            SquidApiSubscriptionQueryName.notifications,
            <Array<SquidSubscriptionNotificationsResponseDto>>(
              data.data.notifications
            )
          )) as Array<SquidSubscriptionNotificationsResponseDto>;
          console.log(
            'data length - ',
            (<Array<SquidSubscriptionNotificationsResponseDto>>(
              data.data.notifications
            )).length
          );
          console.log('filteredData length - ', filteredData.length);
          if (filteredData.length === 0) return;
          await this.handleNewSquidNotification(filteredData);
          await this.dataProvidersService.updateStatusByQueryName({
            name: SquidApiSubscriptionQueryName.notifications,
            lastProcessedBlockNumber: Number.parseInt(
              filteredData[0].activity.blockNumber
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

  async handleNewSquidNotification(
    notifications: Array<SquidSubscriptionNotificationsResponseDto>
  ) {
    for (const squidNotification of notifications) {
      await this.getDecoratedSquidNotifications(squidNotification);
    }
  }

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

  async getDecoratedSquidNotifications(
    rawSquidData: SquidSubscriptionNotificationsResponseDto
  ) {
    const { activity, account, id } = rawSquidData;
    switch (rawSquidData.activity.event) {
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
