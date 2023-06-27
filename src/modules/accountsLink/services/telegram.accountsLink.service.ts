import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { sortObj } from 'jsonabc';
import {
  NotificationServiceName
} from '../typeorm/accountsLink.entity';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import {
  SignedMessageAction,
  SignedMessageWithDetails
} from '../dto/substrateTgAccountsLinkingMsg.dto';
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
import { UnlinkTelegramAccountResponseDto } from '../dto/unlinkTelegramAccount.response.dto';
import { ProcessLinkingIdOrAddressResponseTelegramDto } from '../dto/processLinkingIdOrAddressResponse.telegram.dto';
import { SignatureNonceService } from '../../signatureNonce/services/signatureNonce.service';

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
    @Inject(forwardRef(() => SignatureNonceService))
    public signatureNonceService: SignatureNonceService,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  async findAllActiveByTgAccountId({
    accountId,
    following
  }: {
    accountId: string;
    following: boolean;
  }) {
    return await this.accountsLinkService.accountsLinkRepository.find({
      where: {
        notificationServiceAccountId: { $eq: accountId },
        notificationServiceName: { $eq: NotificationServiceName.telegram },
        active: { $eq: true },
        following: { $eq: following }
      }
    });
  }

  async getTelegramBotLinkingMessage(
    action: SignedMessageAction,
    substrateAccount: string
  ): Promise<AccountsLinkingMessageTemplateGqlType> {
    // @ts-ignore
    let tpl: SignedMessageWithDetails = {
      action,
      signature: '',
      address:
        this.cryptoUtils.substrateAddressToSubsocialFormat(substrateAccount),
      payload: sortObj({
        nonce:
          await this.signatureNonceService.getOrCreateNonceBySubstrateAccountId(
            substrateAccount
          ),
        action
      })
    };

    return {
      messageTpl: encodeURIComponent(JSON.stringify(tpl))
    };
  }

  async ensureTemporaryLinkingIdExpiration(
    linkingIdEntity: TelegramTemporaryLinkingId
  ): Promise<TelegramTemporaryLinkingId | null> {
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
            $eq: parsedMessageWithDetails.address
          },
          notificationServiceName: NotificationServiceName.telegram,
          active: true,
          following: false
        }
      });

    if (
      existingLinkForSubstrateAccount &&
      existingLinkForSubstrateAccount.length > 0
    )
      throw new ValidationError(
        `Account ${parsedMessageWithDetails.address} already has linked Telegram account`
      );

    const existingTmpId = await this.getTemporaryLinkingIdBySubstrateAccount(
      parsedMessageWithDetails.address
    );
    if (existingTmpId) return existingTmpId;

    const newTmpIdEntity = new TelegramTemporaryLinkingId();
    newTmpIdEntity.id = crypto.randomUUID();
    newTmpIdEntity.substrateAccountId = parsedMessageWithDetails.address;
    newTmpIdEntity.createdAt = new Date();

    await this.telegramTemporaryLinkingIdRepository.save(newTmpIdEntity);
    return newTmpIdEntity;
  }

  async getActiveLinkedTgAccountsBySubstrateAccount({
    substrateAccount,
    following
  }: {
    substrateAccount: string;
    following: boolean;
  }): Promise<LinkedTgAccountsToSubstrateAccountResponseType> {
    const links = await this.accountsLinkService.accountsLinkRepository.find({
      where: {
        substrateAccountId: { $eq: substrateAccount },
        notificationServiceName: { $eq: NotificationServiceName.telegram },
        active: { $eq: true },
        following: { $eq: following }
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

  async getOrCreateTelegramAccount({
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

  async processTemporaryLinkingIdOrAddress({
    telegramAccountData,
    linkingIdOrAddress
  }: ProcessLinkingIdInputTelegramDto): Promise<ProcessLinkingIdOrAddressResponseTelegramDto> {
    /**
     * It means that request came from Telegram bot and user must provide valid Substrate address
     */
    if (this.cryptoUtils.isValidSubstrateAddress(linkingIdOrAddress))
      return this.processFollowingOfSubstrateAddress({
        telegramAccountData,
        linkingIdOrAddress
      });

    /**
     * It means that request came from API and valid Temporary linking ID must be provided
     */
    return this.processTemporaryLinkingId({
      telegramAccountData,
      linkingIdOrAddress
    });
  }

  async processTemporaryLinkingId({
    telegramAccountData,
    linkingIdOrAddress
  }: ProcessLinkingIdInputTelegramDto): Promise<ProcessLinkingIdOrAddressResponseTelegramDto> {
    const linkingIdEntity = await this.getTemporaryLinkingIdById(
      linkingIdOrAddress
    );

    if (!linkingIdEntity)
      throw new ValidationError(
        'Your connection ID has expired or invalid. Please return to your Grill.chat settings and try again.'
      );

    const existingFollowingLink =
      await this.accountsLinkService.accountsLinkRepository.findOne({
        where: {
          notificationServiceName: NotificationServiceName.telegram,
          notificationServiceAccountId:
            telegramAccountData.accountId.toString(),
          substrateAccountId: linkingIdEntity.substrateAccountId,
          following: true,
          active: true
        }
      });

    if (existingFollowingLink)
      return {
        existing: true,
        entity: existingFollowingLink,
        success: false,
        message: `You already have an active subscription for address ${linkingIdEntity.substrateAccountId}`
      };

    const accountsLinkResult = await this.accountsLinkService.ensureAccountLink(
      {
        notificationServiceName: NotificationServiceName.telegram,
        notificationServiceAccountId: telegramAccountData.accountId.toString(),
        substrateAccountId: linkingIdEntity.substrateAccountId,
        following: false,
        active: true
      }
    );

    await this.getOrCreateTelegramAccount(telegramAccountData);

    await this.telegramTemporaryLinkingIdRepository.remove(linkingIdEntity);

    return {
      ...accountsLinkResult,
      success: true
    };
  }

  /**
   * Linking Telegram and Substrate accounts via Telegram bot
   * @param telegramAccountData
   * @param linkingIdOrAddress
   */
  async processFollowingOfSubstrateAddress({
    telegramAccountData,
    linkingIdOrAddress
  }: ProcessLinkingIdInputTelegramDto): Promise<ProcessLinkingIdOrAddressResponseTelegramDto> {
    const ownFollowingLink =
      await this.accountsLinkService.accountsLinkRepository.findOne({
        where: {
          notificationServiceName: NotificationServiceName.telegram,
          notificationServiceAccountId:
            telegramAccountData.accountId.toString(),
          substrateAccountId: linkingIdOrAddress,
          following: false,
          active: true
        }
      });

    if (ownFollowingLink)
      return {
        existing: true,
        entity: ownFollowingLink,
        success: false,
        message: `You already have an active connection to your own account ${linkingIdOrAddress}. Please disconnect this address in Grill.chat and subscribe to it in the Telegram bot using the command "/link ${linkingIdOrAddress}"`
      };

    const accountsLinkResult = await this.accountsLinkService.ensureAccountLink(
      {
        notificationServiceName: NotificationServiceName.telegram,
        notificationServiceAccountId: telegramAccountData.accountId.toString(),
        substrateAccountId: linkingIdOrAddress,
        following: true,
        active: true
      }
    );

    await this.getOrCreateTelegramAccount(telegramAccountData);

    return {
      ...accountsLinkResult,
      success: !accountsLinkResult.existing,
      message: accountsLinkResult.existing
        ? `You already have an active subscription for address ${linkingIdOrAddress}`
        : undefined
    };
  }

  async unlinkTelegramAccountWithSignedMessage(
    signedMsgWithDetails: string
  ): Promise<UnlinkTelegramAccountResponseDto> {
    const parsedMessageWithDetails =
      await this.accountsLinkService.parseAndVerifySignedMessageWithDetails(
        decodeURIComponent(signedMsgWithDetails)
      );

    if (
      parsedMessageWithDetails.payload.action !==
      SignedMessageAction.UNLINK_TELEGRAM_ACCOUNT
    )
      throw new Error(`Invalid action.`);

    const result = this.unlinkTelegramAccount({
      substrateAccount: parsedMessageWithDetails.address,
      following: false
    });

    await this.signatureNonceService.increaseNonceBySubstrateAccountId(
      parsedMessageWithDetails.address
    );

    return result;
  }

  async unlinkTelegramAccountWithAddress({
    substrateAccount,
    telegramAccountId
  }: {
    substrateAccount: string;
    telegramAccountId: string;
  }): Promise<UnlinkTelegramAccountResponseDto> {
    const ownFollowingLink =
      await this.accountsLinkService.accountsLinkRepository.findOne({
        where: {
          notificationServiceName: NotificationServiceName.telegram,
          notificationServiceAccountId: telegramAccountId.toString(),
          substrateAccountId: substrateAccount,
          following: false,
          active: true
        }
      });

    if (ownFollowingLink)
      return {
        success: false,
        message: `You cannot unlink your own Telegram account here, but you can do so in the settings of Grill.chat`
      };

    return this.unlinkTelegramAccount({
      substrateAccount,
      telegramAccountId,
      following: true
    });
  }

  async unlinkTelegramAccount({
    substrateAccount,
    telegramAccountId,
    following
  }: {
    substrateAccount: string;
    following: boolean;
    telegramAccountId?: string;
  }): Promise<UnlinkTelegramAccountResponseDto> {
    const activeLinks =
      await this.accountsLinkService.accountsLinkRepository.find({
        where: {
          substrateAccountId: {
            $eq: substrateAccount
          },
          notificationServiceName: NotificationServiceName.telegram,
          active: { $eq: true },
          following: { $eq: following },
          ...(following && telegramAccountId
            ? { notificationServiceAccountId: telegramAccountId }
            : {})
        }
      });

    if (!activeLinks || activeLinks.length === 0)
      return {
        success: false,
        message: !following
          ? `Account ${substrateAccount} doesn't have active connected Telegram accounts.`
          : `You are not subscribed to this address - ${substrateAccount}`
      };

    for (const link of activeLinks) {
      link.active = false;
      await this.accountsLinkService.accountsLinkRepository.save(link);
    }

    return {
      success: true
    };
  }
}
