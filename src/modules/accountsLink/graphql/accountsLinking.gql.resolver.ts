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
import { LinkedTgAccountsToSubstrateAccountGqlType } from './linkedTgAccountsToSubstrateAccount.gql.type';

@Resolver((of) => AccountsLinkingMessageTemplateGqlType)
export class AccountsLinkingGqlResolver {
  constructor(private accountsLinkService: AccountsLinkService) {}

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  linkSubstrateTelegramAccountsMsg(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.accountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_LINK,
      substrateAccount
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  unlinkSubstrateTelegramAccountsMsg(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.accountsLinkService.getTelegramBotLinkingMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_UNLINK,
      substrateAccount
    );
  }

  @Query(() => LinkedTgAccountsToSubstrateAccountGqlType)
  linkedTgAccountsToSubstrateAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.accountsLinkService.getActiveLinkedTgAccountsBySubstrateAccountWithDetails(
      substrateAccount
    );
  }
}
