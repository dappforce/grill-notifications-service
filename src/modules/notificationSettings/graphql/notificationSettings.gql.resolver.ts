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

@Resolver((of) => NotificationSettingsGqlType)
export class NotificationSettingsGqlResolver {
  constructor(
    private notificationSettingsService: NotificationSettingsService
  ) {}

  @Query(() => NotificationSettingsGqlType)
  notificationSettingsByAccountId(@Args('id') id: string) {
    return this.notificationSettingsService.findByAccountId(id);
  }

  @Mutation((returns) => NotificationSettingsGqlType)
  @UseGuards(AdminGqlGuard)
  createNotificationSettingsToAccount(
    @Args('createNotificationSettingsInput')
    createNotificationSettingsInput: NotificationSettingsGqlInput
  ) {
    return this.notificationSettingsService.createToAccount(
      createNotificationSettingsInput
    );
  }

  @Mutation((returns) => NotificationSettingsGqlType)
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
