import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import {
  AccountsLink,
  NotificationServiceName
} from '../typeorm/accountsLink.entity';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import {
  SignedMessageAction,
  SignedMessageWithDetails
} from '../dto/substreateTgAccountsLinkingMsg.dto';
import { AccountsLinkingMessageTemplateGqlType } from '../graphql/accountsLinkingMessageTemplate.gql.type';
import { ProcessLinkingIdInputTelegramDto } from '../dto/processLinkingIdInput.telegram.dto';
import { LinkedTgAccountsToSubstrateAccountResponseType } from '../graphql/linkedTgAccountsToSubstrateAccount.gql.type';
import { AccountsLinkService } from './accountsLink.service';
import { TelegramAccount } from '../typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from '../typeorm/telegramTemporaryLinkingId.entity';
import { CommonUtils } from '../../../common/utils/common.util';
import { xSocialConfig } from '../../../config';
import * as crypto from 'crypto';
import { ValidationError } from '@nestjs/apollo';
import { UnlinkTelegramAccountResponseDto } from '../graphql/unlinkTelegramAccount.response.dto';

@Injectable()
export class TelegramAccountsLinkService {
  constructor(
    @InjectRepository(TelegramAccount)
    public telegramAccountRepository: MongoRepository<TelegramAccount>,
    @InjectRepository(TelegramTemporaryLinkingId)
    public telegramTemporaryLinkingIdRepository: MongoRepository<TelegramTemporaryLinkingId>,
    @Inject(forwardRef(() => AccountsLinkService))
    public accountsLinkService: AccountsLinkService,
    public cryptoUtils: CryptoUtils,
    public commonUtils: CommonUtils,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  getTelegramBotLinkingMessage(
    action: SignedMessageAction,
    substrateAccount: string
  ): AccountsLinkingMessageTemplateGqlType {
    // @ts-ignore
    let tpl: SignedMessageWithDetails = {
      action,
      signature: '',
      substrateAccount:
        this.cryptoUtils.substrateAddressToSubsocialFormat(substrateAccount),
      payload: {
        action
      }
    };

    return {
      messageTpl: encodeURIComponent(JSON.stringify(tpl))
    };
  }

  async ensureTemporaryLinkingIdExpiration(
    linkingIdEntity: TelegramTemporaryLinkingId
  ): Promise<TelegramTemporaryLinkingId | null> {
    console.dir(linkingIdEntity, { depth: null });
    const isIdEntityExpired = this.commonUtils.isOlderThan(
      linkingIdEntity.createdAt,
      this.xSocialConfig.TELEGRAM_TEMPORARY_LINKING_ID_EXPIRATION_TIME_MINS
    );

    if (!isIdEntityExpired) {
      return linkingIdEntity;
    }
    await this.telegramTemporaryLinkingIdRepository.delete(linkingIdEntity);
    return null;
  }

  async getTemporaryLinkingIdBySubstrateAccount(
    substrateAccount: string
  ): Promise<TelegramTemporaryLinkingId | null> {
    const existingTmpId =
      await this.telegramTemporaryLinkingIdRepository.findOne({
        where: {
          substrateAccountId: { $eq: substrateAccount }
        }
      });

    if (!existingTmpId) return null;
    const ensuredEntity = await this.ensureTemporaryLinkingIdExpiration(
      existingTmpId
    );
    if (ensuredEntity) return existingTmpId;
    return null;
  }

  async getTemporaryLinkingIdById(
    id: string
  ): Promise<TelegramTemporaryLinkingId | null> {
    const existingTmpId =
      await this.telegramTemporaryLinkingIdRepository.findOne({
        where: {
          id: { $eq: id.trim() }
        }
      });

    if (!existingTmpId) return null;
    const ensuredEntity = await this.ensureTemporaryLinkingIdExpiration(
      existingTmpId
    );
    if (ensuredEntity) return existingTmpId;
    return null;
  }

  async getOrCreateTemporaryLinkingId(
    parsedMessageWithDetails: SignedMessageWithDetails
  ): Promise<TelegramTemporaryLinkingId> {
    const existingLinkForSubstrateAccount =
      await this.accountsLinkService.accountsLinkRepository.find({
        where: {
          substrateAccountId: {
            $eq: parsedMessageWithDetails.substrateAccount
          },
          notificationServiceName: NotificationServiceName.telegram,
          active: true
        }
      });

    if (
      existingLinkForSubstrateAccount &&
      existingLinkForSubstrateAccount.length > 0
    )
      throw new ValidationError(
        `Account ${parsedMessageWithDetails.substrateAccount} already has linked Telegram account`
      );

    const existingTmpId = await this.getTemporaryLinkingIdBySubstrateAccount(
      parsedMessageWithDetails.substrateAccount
    );
    if (existingTmpId) return existingTmpId;

    const newTmpIdEntity = new TelegramTemporaryLinkingId();
    newTmpIdEntity.id = crypto.randomUUID();
    newTmpIdEntity.substrateAccountId =
      parsedMessageWithDetails.substrateAccount;
    newTmpIdEntity.createdAt = new Date();

    await this.telegramTemporaryLinkingIdRepository.save(newTmpIdEntity);
    return newTmpIdEntity;
  }

  async getActiveLinkedTgAccountsBySubstrateAccount(
    substrateAccount: string
  ): Promise<LinkedTgAccountsToSubstrateAccountResponseType> {
    const links = await this.accountsLinkService.accountsLinkRepository.find({
      where: {
        substrateAccountId: { $eq: substrateAccount },
        notificationServiceName: { $eq: NotificationServiceName.telegram },
        active: true
      }
    });

    const telegramAccountsMap = new Map<string, TelegramAccount>(
      (
        await this.telegramAccountRepository.find({
          where: {
            accountId: {
              $in: links.map((link) => link.notificationServiceAccountId)
            }
          }
        })
      ).map((tgAcc) => [tgAcc.accountId, tgAcc])
    );

    return {
      telegramAccounts: links.map((link) => {
        const tgAccount = telegramAccountsMap.get(
          link.notificationServiceAccountId
        );
        return {
          accountId: tgAccount ? tgAccount.accountId : '',
          userName: tgAccount ? tgAccount.userName : '',
          firstName: tgAccount ? tgAccount.firstName : '',
          lastName: tgAccount ? tgAccount.lastName : '',
          phoneNumber: tgAccount ? tgAccount.phoneNumber : ''
        };
      })
    };
  }

  async ensureTelegramAccount({
    accountId,
    phoneNumber,
    userName,
    firstName,
    lastName
  }: Omit<TelegramAccount, '_id'>) {
    let entity = await this.telegramAccountRepository.findOne({
      where: {
        accountId: { $eq: accountId }
      }
    });

    if (entity) return entity;

    entity = new TelegramAccount();
    entity.accountId = accountId;
    entity.phoneNumber = phoneNumber;
    entity.userName = userName;
    entity.firstName = firstName;
    entity.lastName = lastName;

    await this.telegramAccountRepository.save(entity);

    return entity;
  }

  async processTemporaryLinkingId({
    telegramAccountData,
    linkingId
  }: ProcessLinkingIdInputTelegramDto): Promise<AccountsLink> {
    const linkingIdEntity = await this.getTemporaryLinkingIdById(linkingId);

    if (!linkingIdEntity)
      throw new ValidationError(
        'Your connection session is expired. Please, go to Grill Notifications setting and run Connection flow again.'
      );

    const accountsLink = await this.accountsLinkService.ensureAccountLink({
      notificationServiceName: NotificationServiceName.telegram,
      notificationServiceAccountId: telegramAccountData.accountId.toString(),
      substrateAccountId: linkingIdEntity.substrateAccountId,
      active: true
    });

    await this.ensureTelegramAccount(telegramAccountData);

    await this.telegramTemporaryLinkingIdRepository.remove(linkingIdEntity);

    return accountsLink;
  }

  async unlinkTelegramAccount(
    signedMsgWithDetails: string
  ): Promise<UnlinkTelegramAccountResponseDto> {
    const parsedMessageWithDetails =
      this.accountsLinkService.parseAndVerifySignedMessageWithDetails(
        decodeURIComponent(signedMsgWithDetails)
      );

    if (
      parsedMessageWithDetails.payload.action !==
      SignedMessageAction.TELEGRAM_ACCOUNT_UNLINK
    )
      throw new Error(`Invalid action.`);

    const activeLinks =
      await this.accountsLinkService.accountsLinkRepository.find({
        where: {
          substrateAccountId: {
            $eq: parsedMessageWithDetails.substrateAccount
          },
          notificationServiceName: NotificationServiceName.telegram,
          active: true
        }
      });

    if (!activeLinks || activeLinks.length === 0)
      return {
        success: false,
        message: `Account ${parsedMessageWithDetails.substrateAccount} doesn't have active connected Telegram accounts.`
      };

    for (const link of activeLinks) {
      link.active = false;
      await this.accountsLinkService.accountsLinkRepository.save(link);
    }

    return {
      success: true
    };
  }

  // async deactivateAllLinksByTgAccount(tgAccountId: number) {
  //   const existingLinks = await this.findAllActiveByTgAccountId(tgAccountId);
  //
  //   for (const link of existingLinks) {
  //     link.active = false;
  //     await this.accountsLinkRepository.save(link);
  //   }
  // }
}
