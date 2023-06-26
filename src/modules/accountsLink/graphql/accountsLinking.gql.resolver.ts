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
import { CreateTemporaryLinkingIdForTelegramResponseDto } from '../dto/createTemporaryLinkingIdForTelegram.response.dto';
import { UnlinkTelegramAccountResponseDto } from '../dto/unlinkTelegramAccount.response.dto';

@Resolver((of) => AccountsLinkingMessageTemplateGqlType)
export class AccountsLinkingGqlResolver {
  constructor(
    private accountsLinkService: AccountsLinkService,
    private telegramAccountsLinkService: TelegramAccountsLinkService
  ) {}

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  @UseGuards(AdminGqlGuard)
  linkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.LINK_TELEGRAM_ACCOUNT,
      substrateAccount
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  @UseGuards(AdminGqlGuard)
  unlinkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT,
      substrateAccount
    );
  }

  @Query(() => LinkedTgAccountsToSubstrateAccountResponseType)
  @UseGuards(AdminGqlGuard)
  telegramAccountsLinkedToSubstrateAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getActiveLinkedTgAccountsBySubstrateAccount(
      { substrateAccount, following: false }
    );
  }

  @Mutation((returns) => CreateTemporaryLinkingIdForTelegramResponseDto)
  @UseGuards(AdminGqlGuard)
  async createTemporaryLinkingIdForTelegram(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return {
      id: (
        await this.accountsLinkService.createTemporaryLinkingId(
          signedMessageWithDetails,
          SignedMessageAction.LINK_TELEGRAM_ACCOUNT
        )
      ).id
    };
  }
  @Mutation((returns) => UnlinkTelegramAccountResponseDto)
  @UseGuards(AdminGqlGuard)
  async unlinkTelegramAccount(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return this.telegramAccountsLinkService.unlinkTelegramAccountBySubstrateAccountWithSignedMessage(
      signedMessageWithDetails
    );
  }
}
