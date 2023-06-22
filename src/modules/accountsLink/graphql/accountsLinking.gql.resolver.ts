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
import { AccountsLinkingMessageTemplateGqlType } from './accountsLinkingMessageTemplate.gql.type';
import { AccountsLinkService } from '../services/accountsLink.service';
import { SignedMessageAction } from '../dto/substreateTgAccountsLinkingMsg.dto';
import { LinkedTgAccountsToSubstrateAccountResponseType } from './linkedTgAccountsToSubstrateAccount.gql.type';
import { NotificationSettings } from '../../notificationSettings/typeorm/notificationSettings.entity';
import { UseGuards } from '@nestjs/common';
import { AdminGqlGuard } from '../../../common/guards/admin.gql.guard';
import { NotificationSettingsGqlInput } from '../../notificationSettings/graphql/notificationSettings.gql.input';
import { TelegramAccountsLinkService } from '../services/telegram.accountsLink.service';
import { CreateTemporaryLinkingIdForTelegramResponseDto } from './createTemporaryLinkingIdForTelegram.response.dto';
import { UnlinkTelegramAccountResponseDto } from './unlinkTelegramAccount.response.dto';

@Resolver((of) => AccountsLinkingMessageTemplateGqlType)
export class AccountsLinkingGqlResolver {
  constructor(
    private accountsLinkService: AccountsLinkService,
    private telegramAccountsLinkService: TelegramAccountsLinkService
  ) {}

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  linkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_LINK,
      substrateAccount
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  unlinkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_UNLINK,
      substrateAccount
    );
  }

  @Query(() => LinkedTgAccountsToSubstrateAccountResponseType)
  telegramAccountsLinkedToSubstrateAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getActiveLinkedTgAccountsBySubstrateAccount(
      substrateAccount
    );
  }

  @Mutation((returns) => CreateTemporaryLinkingIdForTelegramResponseDto)
  // @UseGuards(AdminGqlGuard)
  async createTemporaryLinkingIdForTelegram(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return {
      id: (
        await this.accountsLinkService.createTemporaryLinkingId(
          signedMessageWithDetails,
          SignedMessageAction.TELEGRAM_ACCOUNT_LINK
        )
      ).id
    };
  }
  @Mutation((returns) => UnlinkTelegramAccountResponseDto)
  // @UseGuards(AdminGqlGuard)
  async unlinkTelegramAccount(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return this.telegramAccountsLinkService.unlinkTelegramAccount(
      signedMessageWithDetails
    );
  }
}
