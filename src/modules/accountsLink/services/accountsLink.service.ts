import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AccountsLink } from '../typeorm/accountsLink.entity';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import {
  SignedMessageWithDetails,
  signedMessage,
  SignedMessageAction
} from '../dto/substrateTgAccountsLinkingMsg.dto';
import { sortObj } from 'jsonabc';
import { EnsureAccountLinkInputDto } from '../dto/ensureAccountLinkInput.dto';
import { TelegramAccountsLinkService } from './telegram.accountsLink.service';
import { SignatureNonceService } from '../../signatureNonce/services/signatureNonce.service';

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>,
    public cryptoUtils: CryptoUtils,
    @Inject(forwardRef(() => SignatureNonceService))
    public signatureNonceService: SignatureNonceService,
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

  async createTemporaryLinkingId(
    signedMsgWithDetails: string,
    action: SignedMessageAction
  ) {
    const parsedMessageWithDetails =
      await this.parseAndVerifySignedMessageWithDetails(
        decodeURIComponent(signedMsgWithDetails)
      );
    switch (action) {
      case SignedMessageAction.LINK_TELEGRAM_ACCOUNT:
        if (
          parsedMessageWithDetails.payload.action !==
          SignedMessageAction.LINK_TELEGRAM_ACCOUNT
        )
          throw new Error(`Invalid action.`);

        const linkingId =
          await this.telegramAccountsLinkService.getOrCreateTemporaryLinkingId(
            parsedMessageWithDetails
          );
        await this.signatureNonceService.increaseNonceBySubstrateAccountId(
          parsedMessageWithDetails.address
        );
        return linkingId;
      default:
        throw new Error('Invalid action value.');
    }
  }

  async createAccountsLink({
    notificationServiceName,
    notificationServiceAccountId,
    substrateAccountId,
    following,
    active
  }: EnsureAccountLinkInputDto) {
    const newAccountsLinkEntity = new AccountsLink();
    newAccountsLinkEntity.notificationServiceAccountId =
      notificationServiceAccountId;
    newAccountsLinkEntity.notificationServiceName = notificationServiceName;
    newAccountsLinkEntity.substrateAccountId = substrateAccountId;
    newAccountsLinkEntity.active = active;
    newAccountsLinkEntity.following = following;
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
    following,
    active
  }: EnsureAccountLinkInputDto): Promise<{
    existing: boolean;
    entity: AccountsLink;
  }> {
    if (!following) {
      const allLinksForSubstrateAccount =
        await this.accountsLinkRepository.find({
          where: {
            notificationServiceName: {
              $eq: notificationServiceName
            },
            substrateAccountId: { $eq: substrateAccountId },
            active: { $eq: true },
            following: { $eq: following }
          }
        });
      const allLinksForNotificationsServiceAccount =
        await this.accountsLinkRepository.find({
          where: {
            notificationServiceName: {
              $eq: notificationServiceName
            },
            notificationServiceAccountId: {
              $eq: notificationServiceAccountId.toString()
            },
            active: { $eq: true },
            following: { $eq: following }
          }
        });

      for (const link of allLinksForSubstrateAccount) {
        link.active = false;
        await this.accountsLinkRepository.save(link);
      }

      for (const link of allLinksForNotificationsServiceAccount) {
        link.active = false;
        await this.accountsLinkRepository.save(link);
      }
    }

    const existingEntity = await this.accountsLinkRepository.findOne({
      where: {
        notificationServiceAccountId: {
          $eq: notificationServiceAccountId.toString()
        },
        notificationServiceName: {
          $eq: notificationServiceName
        },
        substrateAccountId: { $eq: substrateAccountId },
        following: { $eq: following }
      }
    });

    if (existingEntity && existingEntity.active) {
      return {
        existing: true,
        entity: existingEntity
      };
    }

    if (existingEntity) {
      existingEntity.active = active;
      await this.accountsLinkRepository.save(existingEntity);
      return {
        existing: false,
        entity: existingEntity
      };
      console.log('Accounts are already linked');
    } else if (!existingEntity && active) {
      return {
        existing: false,
        entity: await this.createAccountsLink({
          notificationServiceName,
          notificationServiceAccountId,
          substrateAccountId,
          following,
          active
        })
      };
    }
  }

  async parseAndVerifySignedMessageWithDetails(
    signedMessageWithDetails: string
  ): Promise<SignedMessageWithDetails> {
    let parsedMessage = null;
    try {
      parsedMessage = JSON.parse(signedMessageWithDetails);
    } catch (e) {
      throw new Error('Provided invalid message. Json parse'); // TODO add error handler
    }
    if (!signedMessageWithDetails) throw new Error(); // TODO add error handler

    const messageValidation = signedMessage.safeParse(parsedMessage);

    if (!messageValidation.success) {
      throw new Error('Provided invalid message.'); // TODO add error handler
    }

    const { data } = messageValidation;

    if (
      !(await this.signatureNonceService.isValidForSubstrateAccount(
        data.address,
        data.payload.nonce
      ))
    )
      throw new Error('Provided invalid message. Nonce is invalid.');

    if (
      !this.cryptoUtils.isValidSignature({
        address: data.address,
        signature: data.signature,
        message: JSON.stringify(sortObj(data.payload))
      })
    )
      throw new Error('Signature is invalid.'); // TODO add error handler

    return data;
  }
}
