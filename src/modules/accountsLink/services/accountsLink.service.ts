import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import {
  AccountsLink,
  NotificationServiceName
} from '../typeorm/accountsLink.entity';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import {
  SignedMessageWithDetails,
  signedMessage,
  SignedMessageAction
} from '../dto/substreateTgAccountsLinkingMsg.dto';
import { sortObj } from 'jsonabc';
import { AccountsLinkingMessageTemplateGqlType } from '../graphql/accountsLinkingMessageTemplate.gql.type';
import { EnsureAccountLinkInputDto } from '../dto/ensureAccountLinkInput.dto';
import { ProcessLinkingIdInputTelegramDto } from '../dto/processLinkingIdInput.telegram.dto';
import { LinkedTgAccountsToSubstrateAccountResponseType } from '../graphql/linkedTgAccountsToSubstrateAccount.gql.type';
import { TelegramAccountsLinkService } from './telegram.accountsLink.service';

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>,
    public cryptoUtils: CryptoUtils,
    @Inject(forwardRef(() => TelegramAccountsLinkService))
    public telegramAccountsLinkService: TelegramAccountsLinkService
  ) {}

  async findAllActiveBySubstrateAccountId(id: string) {
    return await this.accountsLinkRepository.find({
      where: {
        substrateAccountId: { $eq: id },
        active: true
      }
    });
  }

  async findAllActiveByTgAccountId(id: string) {
    return await this.accountsLinkRepository.find({
      where: {
        notificationServiceAccountId: id,
        notificationServiceName: NotificationServiceName.telegram,
        active: true
      }
    });
  }

  async createTemporaryLinkingId(
    signedMsgWithDetails: string,
    action: SignedMessageAction
  ) {
    const parsedMessageWithDetails =
      this.parseAndVerifySignedMessageWithDetails(
        decodeURIComponent(signedMsgWithDetails)
      );
    switch (action) {
      case SignedMessageAction.TELEGRAM_ACCOUNT_LINK:
        if (
          parsedMessageWithDetails.payload.action !==
          SignedMessageAction.TELEGRAM_ACCOUNT_LINK
        )
          throw new Error(`Invalid action.`);

        return this.telegramAccountsLinkService.getOrCreateTemporaryLinkingId(
          parsedMessageWithDetails
        );
      default:
        throw new Error('Invalid action value.');
    }
  }

  async createAccountsLink({
    notificationServiceName,
    notificationServiceAccountId,
    substrateAccountId,
    active
  }: EnsureAccountLinkInputDto) {
    const newAccountsLinkEntity = new AccountsLink();
    newAccountsLinkEntity.notificationServiceAccountId =
      notificationServiceAccountId;
    newAccountsLinkEntity.notificationServiceName = notificationServiceName;
    newAccountsLinkEntity.substrateAccountId = substrateAccountId;
    newAccountsLinkEntity.active = active;
    newAccountsLinkEntity.createdAt = new Date();

    const entity = await this.accountsLinkRepository.save(
      newAccountsLinkEntity
    );
    return entity;
  }

  async ensureAccountLink({
    notificationServiceName,
    notificationServiceAccountId,
    substrateAccountId,
    active
  }: EnsureAccountLinkInputDto) {
    const existingEntity = await this.accountsLinkRepository.findOne({
      where: {
        notificationServiceAccountId: {
          $eq: notificationServiceAccountId.toString()
        },
        notificationServiceName: {
          $eq: notificationServiceName
        },
        substrateAccountId: { $eq: substrateAccountId }
      }
    });

    const allLinksForSubstrateAccount = await this.accountsLinkRepository.find({
      where: {
        notificationServiceName: {
          $eq: notificationServiceName
        },
        substrateAccountId: { $eq: substrateAccountId },
        active: true
      }
    });

    for (const link of allLinksForSubstrateAccount) {
      link.active = false;
      await this.accountsLinkRepository.save(link);
    }

    if (existingEntity) {
      existingEntity.active = active;
      await this.accountsLinkRepository.save(existingEntity);
      return existingEntity;
      console.log('Accounts are already linked');
    } else if (!existingEntity && active) {
      return await this.createAccountsLink({
        notificationServiceName,
        notificationServiceAccountId,
        substrateAccountId,
        active
      });
    }
  }

  parseAndVerifySignedMessageWithDetails(
    signedMessageWithDetails: string
  ): SignedMessageWithDetails {
    let parsedMessage = null;
    try {
      parsedMessage = JSON.parse(signedMessageWithDetails);
    } catch (e) {
      throw new Error('Provided invalid message.'); // TODO add error handler
    }
    if (!signedMessageWithDetails) throw new Error(); // TODO add error handler

    const messageValidation = signedMessage.safeParse(parsedMessage);

    if (!messageValidation.success) {
      throw new Error('Provided invalid message.'); // TODO add error handler
    }

    const { data } = messageValidation;

    if (
      !this.cryptoUtils.isValidSignature({
        account: data.substrateAccount,
        signature: data.signature,
        message: JSON.stringify(sortObj(data.payload))
      })
    )
      throw new Error('Signature is invalid.'); // TODO add error handler

    return data;
  }
}
