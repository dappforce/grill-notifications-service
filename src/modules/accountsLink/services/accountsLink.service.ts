import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AccountsLink } from '../typeorm/accountsLink.entity';
import {
  SignedMessageWithDetails,
  SignedMessageAction
} from '../../signedMessage/dto/signedMessage.dto';
import { EnsureAccountLinkInputDto } from '../dto/input/ensureAccountLinkInput.dto';
import { TelegramAccountsLinkService } from './telegram.accountsLink.service';
import { SignatureNonceService } from '../../signedMessage/services/signatureNonce.service';

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>,
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
    signedMsgParsed: SignedMessageWithDetails,
    action: SignedMessageAction,
    increaseNonce: boolean = false
  ) {
    switch (action) {
      case SignedMessageAction.LINK_TELEGRAM_ACCOUNT:
        const linkingId =
          await this.telegramAccountsLinkService.getOrCreateTemporaryLinkingId(
            signedMsgParsed
          );
        if (increaseNonce)
          await this.signatureNonceService.increaseNonceBySubstrateAccountId(
            signedMsgParsed.address
          );
        return linkingId.id;
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
    newAccountsLinkEntity.fcmTokens = [];
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
    keepExistingActiveStatus = false,
    following,
    active
  }: EnsureAccountLinkInputDto): Promise<{
    existing: boolean;
    entity: AccountsLink;
  }> {
    if (!following && !keepExistingActiveStatus) {
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
}
