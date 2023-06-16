import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

export class NotificationSubscription {
  constructor(props?: NotificationSubscription) {
    Object.assign(this, props);
  }

  @Column({ nullable: false })
  eventName: string;

  @Column({ nullable: false })
  telegramBot: boolean;

  // TODO: implement other types of notifications
  // @Column({ nullable: false })
  // email: boolean;
}

@Entity()
export class NotificationSettings {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  substrateAccountId: string;

  @Column(() => NotificationSubscription)
  subscriptions: NotificationSubscription[];

  @Column(() => String)
  subscriptionEvents: string[];
}
