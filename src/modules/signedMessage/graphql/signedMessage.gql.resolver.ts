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
import { UseGuards } from '@nestjs/common';
import { AuthGqlGuard } from '../../../common/guards/admin.gql.guard';
import { LinkAddressWithTelegramAccountMessageInput } from '../dto/input/linkAddressWithTelegramAccountMessage.input';
import { SignedMessageWithActionTemplateResponseDto } from '../dto/response/signedMessageWithActionTemplate.response.dto';
import { SignedMessageService } from '../services/signedMessage.service';
import { SignedMessageAction } from '../dto/signedMessage.dto';
import { CommitSignedMessageResponse } from '../dto/response/commitSignedMessage.response';
import { AccountsLinkingMessageTemplateGqlType } from '../dto/response/accountsLinkingMessageTemplate.gql.type';
import { UnlinkAddressWithTelegramAccountMessageInput } from '../dto/input/unlinkAddressWithTelegramAccountMessage.input';
import { AddFcmTokenToAddressMessageMessageInput } from '../dto/input/addFcmTokenToAddressMessage.input';
import { DeleteFcmTokenFromAddressMessageInput } from '../dto/input/deleteFcmTokenFromAddressMessage.input';

@Resolver()
export class SignedMessageGqlResolver {
  constructor(private signedMessageService: SignedMessageService) {}

  @Query(() => AccountsLinkingMessageTemplateGqlType, {
    name: 'linkingMessageForTelegramAccount'
  })
  linkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.LINK_TELEGRAM_ACCOUNT,
      { substrateAddress: substrateAccount }
    );
  }

  @Query(() => SignedMessageWithActionTemplateResponseDto, {
    name: 'linkAddressWithTelegramAccountMessage'
  })
  // @UseGuards(AuthGqlGuard)
  linkAddressWithTelegramAccountMessage(
    @Args('input') input: LinkAddressWithTelegramAccountMessageInput
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.LINK_TELEGRAM_ACCOUNT,
      input
    );
  }

  @Query(() => AccountsLinkingMessageTemplateGqlType, {
    name: 'unlinkingMessageForTelegramAccount'
  })
  // @UseGuards(AuthGqlGuard)
  unlinkingMessageForTelegramAccount(
    @Args('substrateAccount') substrateAccount: string
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT,
      { substrateAddress: substrateAccount }
    );
  }

  @Query(() => SignedMessageWithActionTemplateResponseDto, {
    name: 'unlinkAddressFromTelegramAccountMessage'
  })
  // @UseGuards(AuthGqlGuard)
  unlinkAddressFromTelegramAccountMessage(
    @Args('input') input: UnlinkAddressWithTelegramAccountMessageInput
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT,
      input
    );
  }

  @Query(() => SignedMessageWithActionTemplateResponseDto)
  // @UseGuards(AuthGqlGuard)
  addFcmTokenToAddressMessage(
    @Args('input') input: AddFcmTokenToAddressMessageMessageInput
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.ADD_FCM_TOKEN_TO_ADDRESS,
      input
    );
  }

  @Query(() => SignedMessageWithActionTemplateResponseDto)
  // @UseGuards(AuthGqlGuard)
  deleteFcmTokenFromAddressMessage(
    @Args('input') input: DeleteFcmTokenFromAddressMessageInput
  ) {
    return this.signedMessageService.getMessageWithAction(
      SignedMessageAction.DELETE_FCM_TOKEN_FROM_ADDRESS,
      input
    );
  }

  @Mutation((returns) => CommitSignedMessageResponse, {
    nullable: true
  })
  @UseGuards(AuthGqlGuard)
  commitSignedMessageWithAction(@Args('signedMessage') signedMessage: string) {
    return this.signedMessageService.commitModerationSignedMessage(
      signedMessage
    );
  }
}
