import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Repository } from 'typeorm';
import { xSocialConfig } from '../../../config';
import { AccountsLink } from '../typeorm/accountsLink.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class AccountsLinkService {
  constructor(
    @InjectRepository(AccountsLink)
    public accountsLinkRepository: MongoRepository<AccountsLink>
  ) {}

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
    } else {
      await this.createAccountsLink({
        tgAccountId,
        substrateAccountId,
        active
      });
    }
  }
}

//3o4Gc6tvv2bR6jCvxoo9LckwSeWAq2ALG8WpgAipTY1WoWTG
// 3rJYtZ8EbGtLqfibk96hCFBUJcHHYUwHMB32YzkjhG62oAmR - donations (block 4268534)
