import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../../notification/services/notification.service';
import {
  SquidActivitiesResponseDto,
  SquidNotificationsResponseDto,
} from '../../dto/squid/squidResponse.dto';
import { SquidApiQueryName } from '../../typeorm/squidDataSubscriptionStatus';
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
    private notificationService: NotificationService,
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
