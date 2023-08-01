import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { NotificationServiceName } from '../typeorm/accountsLink.entity';
import {
  AddFcmTokenToAddressSignedMessage,
  DeleteFcmTokenFromAddressSignedMessage
} from '../../signedMessage/dto/signedMessage.dto';
import { AccountsLinkService } from './accountsLink.service';
import { TelegramAccount } from '../typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from '../typeorm/telegramTemporaryLinkingId.entity';
import { SignatureNonceService } from '../../signedMessage/services/signatureNonce.service';
import { CommitSignedMessageResponse } from '../../signedMessage/dto/response/commitSignedMessage.response';

@Injectable()
export class FcmAccountsLinkService {
  constructor(
    @InjectRepository(TelegramAccount)
    public telegramAccountRepository: MongoRepository<TelegramAccount>,
    @InjectRepository(TelegramTemporaryLinkingId)
    public telegramTemporaryLinkingIdRepository: MongoRepository<TelegramTemporaryLinkingId>,
    @Inject(forwardRef(() => AccountsLinkService))
    public accountsLinkService: AccountsLinkService,
    @Inject(forwardRef(() => SignatureNonceService))
    public signatureNonceService: SignatureNonceService
  ) {}

  async addFcmTokenToAddressWithSignedMessage(
    signedMsgParsed: AddFcmTokenToAddressSignedMessage
  ): Promise<CommitSignedMessageResponse> {
    const accountLink = await this.accountsLinkService.ensureAccountLink({
      notificationServiceName: NotificationServiceName.fcm,
      notificationServiceAccountId: signedMsgParsed.address,
      substrateAccountId: signedMsgParsed.address,
      keepExistingActiveStatus: true,
      following: false,
      active: true
    });

    accountLink.entity.fcmTokens = [
      ...new Set([
        ...accountLink.entity.fcmTokens,
        signedMsgParsed.payload.fcmToken
      ]).keys()
    ];

    await this.accountsLinkService.accountsLinkRepository.save(
      accountLink.entity
    );

    return {
      success: true
    };
  }

  async deleteFcmTokenFromAddressWithSignedMessage(
    signedMsgParsed: DeleteFcmTokenFromAddressSignedMessage
  ): Promise<CommitSignedMessageResponse> {
    const accountLink = await this.accountsLinkService.ensureAccountLink({
      notificationServiceName: NotificationServiceName.fcm,
      notificationServiceAccountId: signedMsgParsed.address,
      substrateAccountId: signedMsgParsed.address,
      keepExistingActiveStatus: true,
      following: false,
      active: true
    });

    accountLink.entity.fcmTokens = accountLink.entity.fcmTokens.filter(
      (t) => t !== signedMsgParsed.payload.fcmToken
    );

    await this.accountsLinkService.accountsLinkRepository.save(
      accountLink.entity
    );

    return {
      success: true
    };
  }
}
