import { Command, Ctx, Update, On, Start } from 'nestjs-telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';
import { Context } from '../../../interfaces/context.interface';
import {
  LINK_ACCOUNTS_SCENE_ID,
  LINK_STATUS_SCENE_ID,
  UNLINK_ACCOUNTS_SCENE_ID
} from '../../../app.constants';
import { UpdateType } from '../../../common/decorators/update-type.decorator';
import { xSocialConfig } from '../../../config';

@Update()
export class NotificationsChannel {
  constructor(private readonly xSocialConfig: xSocialConfig) {}

  @Start()
  async onStart(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ) {
    await ctx.scene.enter(LINK_ACCOUNTS_SCENE_ID);
  }

  @Command('link')
  async onManualLinkStatusCommand(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ): Promise<void> {
    await ctx.scene.enter(LINK_ACCOUNTS_SCENE_ID);
  }
  @Command('unlink')
  async onUnLinkStatusCommand(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ): Promise<void> {
    await ctx.scene.enter(UNLINK_ACCOUNTS_SCENE_ID);
  }

  @Command('me')
  async onLinkStatusCommand(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ): Promise<void> {
    await ctx.scene.enter(LINK_STATUS_SCENE_ID);
  }
}
