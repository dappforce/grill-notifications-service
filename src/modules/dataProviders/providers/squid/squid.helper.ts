import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client as GraphqlWsClient } from 'graphql-ws';
import { NotificationService } from '../../../notification/services/notification.service';
import {
  SquidContentExtensionSchemaId,
  SquidActivitiesResponseDto,
  SquidNotificationsResponseDto,
  SquidSubscriptionResponseDto
} from '../../dto/squid/squidResponse.dto';
import { SquidApiQueryName } from '../../typeorm/squidDataSubscriptionStatus';
import { DataProvidersService } from '../../services/dataProviders.service';
import { EventName } from '../../dto/squid/squidEvents.dto';
import axios from 'axios';
import { xSocialConfig } from '../../../../config';

type SquidApiResponse<Q, R> = Q extends SquidApiQueryName.notifications
  ? {
      notifications: Array<SquidNotificationsResponseDto>;
    }
  : Q extends SquidApiQueryName.activities
  ? { activities: SquidActivitiesResponseDto }
  : never;

@Injectable()
export class SquidHelper {
  constructor(
    @Inject('GraphqlWsClient') private graphqlWsClient: GraphqlWsClient,
    private notificationService: NotificationService,
    public dataProvidersService: DataProvidersService,
    private readonly xSocialConfig: xSocialConfig
  ) {}
  async runSquidApiQuery<
    Q extends SquidApiQueryName,
    R extends SquidNotificationsResponseDto | SquidActivitiesResponseDto
  >(query: string): Promise<SquidApiResponse<Q, R>> {
    const resp = await axios({
      url: this.xSocialConfig.DATA_PROVIDER_SQUID_HTTPS_URL,
      method: 'post',
      data: {
        query
      }
    });

    return resp.data.data;
  }
}
