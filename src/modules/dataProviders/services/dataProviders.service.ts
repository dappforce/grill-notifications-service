import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Repository } from 'typeorm';
import {
  SquidApiQueryName,
  SquidDataSubscriptionStatus
} from '../typeorm/squidDataSubscriptionStatus';
import { SubsocialApi } from '@subsocial/api';

@Injectable()
export class DataProvidersService {
  constructor(
    @InjectRepository(SquidDataSubscriptionStatus)
    public squidDataSubscriptionStatusRepository: MongoRepository<SquidDataSubscriptionStatus>,
    public subsocialApiProvider: SubsocialApi
  ) {}

  async getOrCreateStatusByQueryName({
    name,
    lastProcessedBlockNumber
  }: {
    name: SquidApiQueryName;
    lastProcessedBlockNumber?: number;
  }) {
    let entity = await this.squidDataSubscriptionStatusRepository.findOne({
      where: {
        subscriptionQueryName: { $eq: name }
      }
    });

    if (entity) return entity;

    let currentChainBlockNumber = 0;
    if (lastProcessedBlockNumber !== undefined) {
      currentChainBlockNumber = lastProcessedBlockNumber;
    } else {
      const substrateApi = await this.subsocialApiProvider.substrateApi;

      try {
        currentChainBlockNumber = Number.parseInt(
          (await substrateApi.query.system.number()).toString()
        );
        if (Number.isNaN(currentChainBlockNumber)) currentChainBlockNumber = 0;
      } catch (e) {
        console.log(e);
      }
    }

    entity = new SquidDataSubscriptionStatus();
    entity.subscriptionQueryName = name;
    entity.lastProcessedBlockNumber = currentChainBlockNumber;

    await this.squidDataSubscriptionStatusRepository.save(entity);
    return entity;
  }

  async updateStatusByQueryName({
    name,
    lastProcessedBlockNumber
  }: {
    name: SquidApiQueryName;
    lastProcessedBlockNumber: number;
  }) {
    let statusEntity = await this.squidDataSubscriptionStatusRepository.findOne(
      {
        where: {
          subscriptionQueryName: { $eq: name }
        }
      }
    );

    if (!statusEntity) {
      await this.getOrCreateStatusByQueryName({
        name,
        lastProcessedBlockNumber
      });
      return;
    }
    statusEntity.lastProcessedBlockNumber = lastProcessedBlockNumber;
    await this.squidDataSubscriptionStatusRepository.save(statusEntity);
  }
}
