import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  SignedMessageWithDetails,
  signedMessage,
  SignedMessageAction
} from '../dto/signedMessage.dto';
import { sortObj } from 'jsonabc';
import { SignatureNonceService } from './signatureNonce.service';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import { SignedMessageWithActionTemplateResponseDto } from '../dto/response/signedMessageWithActionTemplate.response.dto';
import { SignedMessagePayloadDto } from '../dto/signedMessagePayload.dto';
import {
  GqlCustomError,
  GqlErrorCodes
} from '../../../common/utils/errorFormatting.util';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { TelegramAccountsLinkService } from '../../accountsLink/services/telegram.accountsLink.service';
import { CommitSignedMessageResponse } from '../dto/response/commitSignedMessage.response';

@Injectable()
export class SignedMessageService {
  constructor(
    @Inject(forwardRef(() => SignatureNonceService))
    public signatureNonceService: SignatureNonceService,
    @Inject(forwardRef(() => AccountsLinkService))
    public accountsLinkService: AccountsLinkService,
    @Inject(forwardRef(() => TelegramAccountsLinkService))
    public telegramAccountsLinkService: TelegramAccountsLinkService,
    private cryptoUtils: CryptoUtils
  ) {}

  async getMessageWithAction(
    action: SignedMessageAction,
    messagePayloadArgs: SignedMessagePayloadDto
  ): Promise<SignedMessageWithActionTemplateResponseDto> {
    const substrateAddressDecorated =
      this.cryptoUtils.substrateAddressToSubsocialFormat(
        messagePayloadArgs.substrateAddress
      );
    const nonce =
      await this.signatureNonceService.getOrCreateNonceBySubstrateAccountId(
        substrateAddressDecorated
      );

    if (!substrateAddressDecorated)
      throw new GqlCustomError({
        message: 'Substrate Address is not provided.',
        code: GqlErrorCodes.SIGNED_MESSAGE_TEMPLATE_ADDRESS_NOT_PROVIDED
      });

    const template: SignedMessageWithDetails | null = {
      action,
      signature: '',
      address: substrateAddressDecorated,
      payload: {}
    };

    switch (action) {
      case SignedMessageAction.LINK_TELEGRAM_ACCOUNT:
        template.payload = sortObj({
          nonce,
          action
        });
        break;
      case SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT:
        template.payload = sortObj({
          nonce,
          action
        });
        break;
    }

    return {
      messageTpl: encodeURIComponent(JSON.stringify(template))
    };
  }

  async parseAndVerifySignedMessageWithDetails(
    signedMessageWithDetails: string
  ): Promise<SignedMessageWithDetails> {
    let parsedMessage = null;

    if (!signedMessageWithDetails)
      throw new GqlCustomError({
        message: 'Signed message is not provided',
        code: GqlErrorCodes.SIGNED_MESSAGE_NOT_PROVIDED
      });

    try {
      parsedMessage = JSON.parse(signedMessageWithDetails);
    } catch (e) {
      throw new GqlCustomError({
        message: 'Provided invalid message. Json parse',
        code: GqlErrorCodes.SIGNED_MESSAGE_INVALID_STRUCTURE
      });
    }

    const messageValidation = signedMessage.safeParse(parsedMessage);

    if (!messageValidation.success)
      throw new GqlCustomError({
        message: 'Provided invalid message.',
        code: GqlErrorCodes.SIGNED_MESSAGE_INVALID_STRUCTURE
      });

    const { data } = messageValidation;

    if (
      !(await this.signatureNonceService.isValidForSubstrateAccount(
        data.address,
        data.payload.nonce
      ))
    )
      throw new GqlCustomError({
        message: 'Provided invalid message. Nonce is invalid.',
        code: GqlErrorCodes.SIGNED_MESSAGE_INVALID_NONCE
      });

    if (
      !this.cryptoUtils.isValidSignature({
        address: data.address,
        signature: data.signature,
        message: JSON.stringify(sortObj(data.payload))
      })
    )
      throw new GqlCustomError({
        message: 'Signature is invalid.',
        code: GqlErrorCodes.SIGNED_MESSAGE_INVALID_SIGNATURE
      });

    return data;
  }

  async commitModerationSignedMessage(
    signedMessage: string
  ): Promise<CommitSignedMessageResponse> {
    const parsedMsg = await this.parseAndVerifySignedMessageWithDetails(
      decodeURIComponent(signedMessage.trim())
    );

    /**
     * Ensure correct address format
     */
    parsedMsg.address = this.cryptoUtils.substrateAddressToSubsocialFormat(
      parsedMsg.address
    );

    await this.signatureNonceService.increaseNonceBySubstrateAccountId(
      parsedMsg.address
    );

    switch (parsedMsg.action) {
      case SignedMessageAction.LINK_TELEGRAM_ACCOUNT:
        return {
          data: {
            tmpLinkingIdForTelegram:
              await this.accountsLinkService.createTemporaryLinkingId(
                parsedMsg,
                SignedMessageAction.LINK_TELEGRAM_ACCOUNT
              )
          },
          success: true
        };
        break;
      case SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT:
        return this.telegramAccountsLinkService.unlinkTelegramAccountWithSignedMessage(
          parsedMsg
        );
        break;
      default:
    }
  }
}
