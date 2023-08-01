import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { AccountsLinkingMessageTemplateGqlType } from '../../signedMessage/dto/response/accountsLinkingMessageTemplate.gql.type';
import { AccountsLinkService } from '../services/accountsLink.service';
import { LinkedTgAccountsToSubstrateAccountResponseType } from '../dto/response/linkedTgAccountsToSubstrateAccount.response.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGqlGuard } from '../../../common/guards/admin.gql.guard';
import { TelegramAccountsLinkService } from '../services/telegram.accountsLink.service';
import { CreateTemporaryLinkingIdForTelegramResponseDto } from '../dto/response/createTemporaryLinkingIdForTelegram.response.dto';
import { UnlinkTelegramAccountResponseDto } from '../dto/response/unlinkTelegramAccount.response.dto';
import { SignedMessageService } from '../../signedMessage/services/signedMessage.service';
import { SignedMessageAction } from '../../signedMessage/dto/signedMessage.dto';

@Resolver((of) => AccountsLinkingMessageTemplateGqlType)
export class AccountsLinkingGqlResolver {
  constructor(
    private accountsLinkService: AccountsLinkService,
    private telegramAccountsLinkService: TelegramAccountsLinkService,
    private signedMessageService: SignedMessageService
  ) {}

  @Query(() => LinkedTgAccountsToSubstrateAccountResponseType)
  @UseGuards(AuthGqlGuard)
  telegramAccountsLinkedToSubstrateAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.telegramAccountsLinkService.getActiveLinkedTgAccountsBySubstrateAccount(
      { substrateAccount, following: false }
    );
  }

  /**
   * Deprecated mutation.
   */
  @Mutation((returns) => CreateTemporaryLinkingIdForTelegramResponseDto, {
    description:
      'This mutation is deprecated and "commitSignedMessageWithAction" must be used instead.'
  })
  @UseGuards(AuthGqlGuard)
  async createTemporaryLinkingIdForTelegram(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return {
      id: await this.accountsLinkService.createTemporaryLinkingId(
        await this.signedMessageService.parseAndVerifySignedMessageWithDetails(
          decodeURIComponent(signedMessageWithDetails.trim())
        ),
        SignedMessageAction.LINK_TELEGRAM_ACCOUNT,
        true
      )
    };
  }

  /**
   * Deprecated mutation.
   */
  @Mutation((returns) => UnlinkTelegramAccountResponseDto, {
    description:
      'This mutation is deprecated and "commitSignedMessageWithAction" must be used instead.'
  })
  @UseGuards(AuthGqlGuard)
  async unlinkTelegramAccount(
    @Args('signedMessageWithDetails')
    signedMessageWithDetails: string
  ) {
    return this.telegramAccountsLinkService.unlinkTelegramAccountWithSignedMessage(
      await this.signedMessageService.parseAndVerifySignedMessageWithDetails(
        decodeURIComponent(signedMessageWithDetails.trim())
      ),
      true
    );
  }
}
