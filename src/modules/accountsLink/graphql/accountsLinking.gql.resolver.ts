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

@Resolver((of) => AccountsLinkingMessageTemplateGqlType)
export class AccountsLinkingGqlResolver {
  constructor(private accountsLinkService: AccountsLinkService) {}

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  linkSubstrateTelegramAccountsMsg(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.accountsLinkService.getTelegramBotMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_LINK,
      substrateAccount
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType)
  unlinkSubstrateTelegramAccountsMsg(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.accountsLinkService.getTelegramBotMessage(
      SignedMessageAction.TELEGRAM_ACCOUNT_UNLINK,
      substrateAccount
    );
  }
}
