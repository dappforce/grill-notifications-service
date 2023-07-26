import { MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';
import { AccountsLink } from '../src/modules/accountsLink/typeorm/accountsLink.entity';

export class ChangeNotificationServiceAccountIdType1690365731872
  implements MigrationInterface
{
  public async up(queryRunner: MongoQueryRunner): Promise<void> {
    const accountsLinkRepo = queryRunner.connection.getRepository(AccountsLink);
    const accountsLinks = await accountsLinkRepo.find();

    for (const accountLink of accountsLinks) {
      if (
        accountLink.notificationServiceAccountId &&
        !Array.isArray(accountLink.notificationServiceAccountId)
      ) {
        await accountsLinkRepo.update(
          { substrateAccountId: accountLink.substrateAccountId },
          {
            // @ts-ignore
            notificationServiceAccountId: [
              `${accountLink.notificationServiceAccountId}`
            ]
          }
        );
      }
    }
  }

  public async down(queryRunner: MongoQueryRunner): Promise<void> {
    // Reversing the migration is not possible as data may be lost in the process.

    const accountsLinkRepo = queryRunner.connection.getRepository(AccountsLink);
    const accountsLinks = await accountsLinkRepo.find();

    for (const accountLink of accountsLinks) {
      if (
        accountLink.notificationServiceAccountId &&
        Array.isArray(accountLink.notificationServiceAccountId)
      ) {
        await accountsLinkRepo.update(
          { substrateAccountId: accountLink.substrateAccountId },
          {
            // @ts-ignore
            notificationServiceAccountId:
              accountLink.notificationServiceAccountId.length === 0
                ? accountLink.notificationServiceAccountId[0]
                : accountLink.notificationServiceAccountId.join(',')
          }
        );
      }
    }
  }
}
