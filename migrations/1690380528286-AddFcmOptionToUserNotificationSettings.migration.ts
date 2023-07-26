import { MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';
import { AccountsLink } from '../src/modules/accountsLink/typeorm/accountsLink.entity';
import { NotificationSettings } from '../src/modules/notificationSettings/typeorm/notificationSettings.entity';

export class AddFcmOptionToUserNotificationSettings1690380528286
  implements MigrationInterface
{
  public async up(queryRunner: MongoQueryRunner): Promise<void> {
    const settingsRepo =
      queryRunner.connection.getRepository(NotificationSettings);
    const notificationSettings = await settingsRepo.find();

    for (const settingsItem of notificationSettings) {
      let updated = false;
      let newSubscriptions = [];
      if (settingsItem.subscriptions) {
        for (const sub of settingsItem.subscriptions) {
          if (sub.fcm === undefined) {
            updated = true;
            sub.fcm = true;
          }
          newSubscriptions.push(sub);
        }
      }

      if (updated)
        await settingsRepo.update(
          { substrateAccountId: settingsItem.substrateAccountId },
          {
            subscriptions: newSubscriptions
          }
        );
    }
  }

  public async down(queryRunner: MongoQueryRunner): Promise<void> {
    // Reversing the migration is not possible as data may be lost in the process.
  }
}
