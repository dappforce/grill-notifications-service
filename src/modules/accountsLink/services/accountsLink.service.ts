import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AccountsLink } from '../typeorm/accountsLink.entity';
import { CryptoUtils } from '../../../common/utils/crypto.util';
import {
  SignedMessage,
  signedMessage,
  SignedMessageAction
} from '../dto/substreateTgAccountsLinkingMsg.dto';
import { sortObj } from 'jsonabc';
import { AccountsLinkingMessageTemplateGqlType } from '../graphql/accountsLinkingMessageTemplate.gql.type';
import { EnsureAccountLinkInputDto } from '../dto/ensureAccountLinkInput.dto';
import { ParseLinkingMessageInputDto } from '../dto/parseLinkingMessageInput.dto';
import { LinkedTgAccountsToSubstrateAccountGqlType } from '../graphql/linkedTgAccountsToSubstrateAccount.gql.type';

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>,
    public cryptoUtils: CryptoUtils
  ) {}

  getTelegramBotLinkingMessage(
    action: SignedMessageAction,
    substrateAccount: string
  ): AccountsLinkingMessageTemplateGqlType {
    let tpl: SignedMessage = {
      action: action,
      signature: '',
      substrateAccount:
        this.cryptoUtils.substrateAddressToSubsocialFormat(substrateAccount),
      payload: {
        message:
          `Link to Substrate account ${this.cryptoUtils.substrateAddressToHex(
            substrateAccount
          )} (in hex)`.replace(/\s/g, '_')
      }
    };

    return {
      messageTpl: JSON.stringify(tpl)
    };
  }

  async findAllActiveBySubstrateAccountId(id: string) {
    return await this.accountsLinkRepository.find({
      where: {
        substrateAccountId: { $eq: id },
        active: true
      }
    });
  }

  async findAllActiveByTgAccountId(id: number) {
    return await this.accountsLinkRepository.find({
      where: {
        tgAccountId: id,
        active: true
      }
    });
  }
  async findAllBySubstrateAccountId(id: string) {
    return await this.accountsLinkRepository.find({
      where: {
        substrateAccountId: id
      }
    });
  }

  async findAllByTgAccountId(id: string) {
    return await this.accountsLinkRepository.find({
      where: {
        tgAccountId: id
      }
    });
  }

  async getActiveLinkedTgAccountsBySubstrateAccountWithDetails(
    substrateAccount: string
  ): Promise<LinkedTgAccountsToSubstrateAccountGqlType> {
    const links = await this.findAllActiveBySubstrateAccountId(
      substrateAccount
    );

    return {
      telegramAccounts: links.map(
        ({
          tgAccountId,
          tgAccountUserName,
          tgAccountFirstName,
          tgAccountLastName,
          tgAccountPhoneNumber
        }) => ({
          id: tgAccountId,
          userName: tgAccountUserName,
          firstName: tgAccountFirstName,
          lastName: tgAccountLastName,
          phoneNumber: tgAccountPhoneNumber
        })
      )
    };
  }

  async createAccountsLink({
    tgAccountId,
    tgAccountUserName,
    tgAccountFirstName,
    tgAccountLastName,
    tgAccountPhoneNumber,
    substrateAccountId,
    active = true
  }: EnsureAccountLinkInputDto) {
    const newAccountsLinkEntity = new AccountsLink();
    newAccountsLinkEntity.tgAccountId = tgAccountId;
    newAccountsLinkEntity.tgAccountUserName = tgAccountUserName;
    newAccountsLinkEntity.tgAccountFirstName = tgAccountFirstName;
    newAccountsLinkEntity.tgAccountLastName = tgAccountLastName;
    newAccountsLinkEntity.tgAccountPhoneNumber = tgAccountPhoneNumber;
    newAccountsLinkEntity.substrateAccountId = substrateAccountId;
    newAccountsLinkEntity.active = active;
    newAccountsLinkEntity.createdAt = new Date();

    const ent = await this.accountsLinkRepository.save(newAccountsLinkEntity);
    return ent;
  }

  async ensureAccountLink({
    tgAccountId,
    tgAccountUserName,
    tgAccountPhoneNumber,
    tgAccountFirstName,
    tgAccountLastName,
    substrateAccountId,
    active
  }: EnsureAccountLinkInputDto) {
    // TODO this approach is actual in case when we want to provide support multiple linked TG accounts to one Substrate account.
    // const allLinksForTgAccount = await this.findAllActiveByTgAccountId(
    //   tgAccountId
    // );
    //
    // for (const link of allLinksForTgAccount) {
    //   link.active = false;
    //   await this.accountsLinkRepository.save(link);
    // }

    const existingEntity = await this.accountsLinkRepository.findOne({
      where: {
        tgAccountId: { $eq: tgAccountId },
        substrateAccountId: { $eq: substrateAccountId }
      }
    });

    const allLinksForSubstrateAccount =
      await this.findAllActiveBySubstrateAccountId(substrateAccountId);

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
        tgAccountId,
        tgAccountPhoneNumber,
        tgAccountUserName,
        tgAccountFirstName,
        tgAccountLastName,
        substrateAccountId,
        active
      });
    }
  }

  async parseAndVerifySubstrateAccountFromSignature({
    tgAccountId,
    tgAccountPhoneNumber,
    tgAccountUserName,
    tgAccountFirstName,
    tgAccountLastName,
    linkingMessage
  }: ParseLinkingMessageInputDto) {
    let parsedMessage = null;
    try {
      console.log(linkingMessage);
      parsedMessage = JSON.parse(linkingMessage);
    } catch (e) {
      throw new Error('Provided invalid message.'); // TODO add error handler
    }
    if (!parsedMessage) throw new Error(); // TODO add error handler

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

    let linkActiveStatus = false;

    switch (data.action) {
      case SignedMessageAction.TELEGRAM_ACCOUNT_LINK:
        linkActiveStatus = true;
        break;
      case SignedMessageAction.TELEGRAM_ACCOUNT_UNLINK:
        linkActiveStatus = false;
        break;
      default:
    }

    return await this.ensureAccountLink({
      tgAccountId,
      tgAccountPhoneNumber,
      tgAccountUserName,
      tgAccountFirstName,
      tgAccountLastName,
      substrateAccountId: data.substrateAccount,
      active: linkActiveStatus
    });
  }

  async deactivateAllLinksByTgAccount(tgAccountId: number) {
    const existingLinks = await this.findAllActiveByTgAccountId(tgAccountId);

    for (const link of existingLinks) {
      link.active = false;
      await this.accountsLinkRepository.save(link);
    }
  }
}
