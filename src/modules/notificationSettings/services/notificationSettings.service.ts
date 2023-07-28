import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Repository } from 'typeorm';
import {
  NotificationSettings,
  NotificationSubscription
} from '../typeorm/notificationSettings.entity';
import { NotificationSettingsInputGql } from '../dto/input/notificationSettings.input.gql';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSettings)
    public notificationSettingsRepository: MongoRepository<NotificationSettings>
  ) {}

  async findByAccountId(id: string) {
    return await this.notificationSettingsRepository.findOne({
      where: {
        substrateAccountId: id
      }
    });
  }

  async findByAccountIds(ids: string[]) {
    return await this.notificationSettingsRepository.find({
      where: {
        substrateAccountId: { $in: ids }
      }
    });
  }

  async createToAccount(input: NotificationSettingsInputGql) {
    const subscriptionEvents = [];
    const subscriptions = input.subscriptions.map((sub) => {
      subscriptionEvents.push(sub.eventName);
      return new NotificationSubscription({ ...sub });
    });
    const newSettingsEntity = new NotificationSettings();
    newSettingsEntity.substrateAccountId = input.substrateAccountId;
    newSettingsEntity.subscriptions = subscriptions;
    newSettingsEntity.subscriptionEvents = subscriptionEvents;

    const ent = await this.notificationSettingsRepository.save(
      newSettingsEntity
    );
    return ent;
  }

  async updateToAccount(input: NotificationSettingsInputGql) {
    const existingSettings = await this.notificationSettingsRepository.findOne({
      where: {
        substrateAccountId: input.substrateAccountId
      }
    });
    if (!existingSettings)
      throw new BadRequestException(
        `Account ${input.substrateAccountId} is not found.`
      );

    const subscriptionEvents = [];
    const subscriptions = input.subscriptions.map((sub) => {
      subscriptionEvents.push(sub.eventName);
      return new NotificationSubscription({ ...sub });
    });

    existingSettings.subscriptions = subscriptions;
    existingSettings.subscriptionEvents = subscriptionEvents;

    await this.notificationSettingsRepository.save(existingSettings);
    return existingSettings;
  }

  getDefaultNotificationSubscriptions(): NotificationSubscription[] {
    const defaultEventNames = [
      'CommentReplyCreated',
      'ExtensionDonationCreated'
    ];
    return defaultEventNames.map((eventName) => ({
      telegramBot: true,
      fcm: true,
      eventName
    }));
  }
}
