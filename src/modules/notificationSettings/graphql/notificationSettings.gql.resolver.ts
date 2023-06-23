import {
  Args,
  Field,
  ID,
  Query,
  Resolver,
  ResolveField,
  Parent,
  Mutation
} from '@nestjs/graphql';
import { NotificationSettingsGqlType } from './notificationSettings.gql.type';
import { NotificationSettingsService } from '../services/notificationSettings.service';
import { NotificationSettingsGqlInput } from './notificationSettings.gql.input';
import { UseGuards } from '@nestjs/common';
import { AdminGqlGuard } from '../../../common/guards/admin.gql.guard';
import { NotificationSettings } from '../typeorm/notificationSettings.entity';

@Resolver((of) => NotificationSettings)
export class NotificationSettingsGqlResolver {
  constructor(
    private notificationSettingsService: NotificationSettingsService
  ) {}

  @Query(() => NotificationSettings)
  @UseGuards(AdminGqlGuard)
  async notificationSettingsByAccountId(@Args('id') id: string) {
    return this.notificationSettingsService.findByAccountId(id);
  }

  @Mutation((returns) => NotificationSettings)
  @UseGuards(AdminGqlGuard)
  createNotificationSettingsToAccount(
    @Args('createNotificationSettingsInput')
    createNotificationSettingsInput: NotificationSettingsGqlInput
  ) {
    return this.notificationSettingsService.createToAccount(
      createNotificationSettingsInput
    );
  }

  @Mutation((returns) => NotificationSettings)
  @UseGuards(AdminGqlGuard)
  updateNotificationSettingsToAccount(
    @Args('updateNotificationSettingsInput')
    updateNotificationSettingsInput: NotificationSettingsGqlInput
  ) {
    return this.notificationSettingsService.updateToAccount(
      updateNotificationSettingsInput
    );
  }
}
