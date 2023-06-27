import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { AccountsLinkingMessageTemplateGqlType } from './accountsLinkingMessageTemplate.gql.type';
import { AccountsLinkService } from '../services/accountsLink.service';
import { SignedMessageAction } from '../dto/substrateTgAccountsLinkingMsg.dto';
import { LinkedTgAccountsToSubstrateAccountResponseType } from './linkedTgAccountsToSubstrateAccount.gql.type';
import { UseGuards } from '@nestjs/common';
import { AuthGqlGuard } from '../../../common/guards/admin.gql.guard';
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
  @UseGuards(AuthGqlGuard)
  linkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.LINK_TELEGRAM_ACCOUNT,
      substrateAccount
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  @UseGuards(AuthGqlGuard)
  unlinkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT,
      substrateAccount
    );
  }

  @Query(() => LinkedTgAccountsToSubstrateAccountResponseType)
  @UseGuards(AuthGqlGuard)
  telegramAccountsLinkedToSubstrateAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getActiveLinkedTgAccountsBySubstrateAccount(
      { substrateAccount, following: false }
    );
  }

  @Mutation((returns) => CreateTemporaryLinkingIdForTelegramResponseDto)
  @UseGuards(AuthGqlGuard)
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
  @UseGuards(AuthGqlGuard)
  async unlinkTelegramAccount(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return this.telegramAccountsLinkService.unlinkTelegramAccountWithSignedMessage(
      signedMessageWithDetails
    );
  }
}
