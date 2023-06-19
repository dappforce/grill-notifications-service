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

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>,
    public cryptoUtils: CryptoUtils
  ) {}

  getTelegramBotMessage(
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

  async createAccountsLink({
    tgAccountId,
    substrateAccountId,
    active = true
  }: {
    tgAccountId: number;
    substrateAccountId: string;
    active: boolean;
  }) {
    const newAccountsLinkEntity = new AccountsLink();
    newAccountsLinkEntity.tgAccountId = tgAccountId;
    newAccountsLinkEntity.substrateAccountId = substrateAccountId;
    newAccountsLinkEntity.active = active;
    newAccountsLinkEntity.createdAt = new Date();

    const ent = await this.accountsLinkRepository.save(newAccountsLinkEntity);
    return ent;
  }

  async ensureAccountLink({
    tgAccountId,
    substrateAccountId,
    active = true
  }: {
    tgAccountId: number;
    substrateAccountId: string;
    active: boolean;
  }) {
    const existingEntity = await this.accountsLinkRepository.findOne({
      where: {
        tgAccountId: { $eq: tgAccountId },
        substrateAccountId: { $eq: substrateAccountId }
      }
    });

    const allLinksForTgAccount = await this.findAllActiveByTgAccountId(
      tgAccountId
    );

    for (const link of allLinksForTgAccount) {
      link.active = false;
      await this.accountsLinkRepository.save(link);
    }

    if (existingEntity) {
      existingEntity.active = true;
      await this.accountsLinkRepository.save(existingEntity);
      console.log('Accounts are already linked');
    } else {
      await this.createAccountsLink({
        tgAccountId,
        substrateAccountId,
        active
      });
      console.log('New accounts link has been created');
    }
  }

  async parseAndVerifySubstrateAccountFromSignature({
    tgAccountId,
    linkingMessage
  }: {
    tgAccountId: number;
    linkingMessage: string;
  }) {
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

    await this.ensureAccountLink({
      tgAccountId,
      substrateAccountId: data.substrateAccount,
      active: true
    });
  }
}

//3o4Gc6tvv2bR6jCvxoo9LckwSeWAq2ALG8WpgAipTY1WoWTG
// 3rJYtZ8EbGtLqfibk96hCFBUJcHHYUwHMB32YzkjhG62oAmR - donations (block 4268534)
