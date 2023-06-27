import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { NotificationSettingsService } from '../services/notificationSettings.service';
import { NotificationSettingsGqlInput } from './notificationSettings.gql.input';
import { UseGuards } from '@nestjs/common';
import { AuthGqlGuard } from '../../../common/guards/admin.gql.guard';
import { NotificationSettings } from '../typeorm/notificationSettings.entity';

@Resolver((of) => NotificationSettings)
export class NotificationSettingsGqlResolver {
  constructor(
    private notificationSettingsService: NotificationSettingsService
  ) {}

  @Query(() => NotificationSettings)
  @UseGuards(AuthGqlGuard)
  async notificationSettingsByAccountId(@Args('id') id: string) {
    return this.notificationSettingsService.findByAccountId(id);
  }

  @Mutation((returns) => NotificationSettings)
  @UseGuards(AuthGqlGuard)
  createNotificationSettingsToAccount(
    @Args('createNotificationSettingsInput')
    createNotificationSettingsInput: NotificationSettingsGqlInput
  ) {
    return this.notificationSettingsService.createToAccount(
      createNotificationSettingsInput
    );
  }

  @Mutation((returns) => NotificationSettings)
  @UseGuards(AuthGqlGuard)
  updateNotificationSettingsToAccount(
    @Args('updateNotificationSettingsInput')
    updateNotificationSettingsInput: NotificationSettingsGqlInput
  ) {
    return this.notificationSettingsService.updateToAccount(
      updateNotificationSettingsInput
    );
  }
}
