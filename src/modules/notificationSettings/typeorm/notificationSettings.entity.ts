import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationSubscription {
  constructor(props?: NotificationSubscription) {
    Object.assign(this, props);
  }

  @Field({ nullable: false })
  @Column({ nullable: false })
  eventName: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  telegramBot: boolean;

  // TODO: implement other types of notifications
  @Column({ nullable: false })
  fcm: boolean;
}

@ObjectType('NotificationSettingsGql')
@Entity()
export class NotificationSettings {
  @ObjectIdColumn()
  _id: string;

  @Field({ nullable: false })
  @PrimaryColumn()
  substrateAccountId: string;

  @Field(() => [NotificationSubscription])
  @Column(() => NotificationSubscription)
  subscriptions: NotificationSubscription[];

  @Field(() => String)
  @Column(() => String)
  subscriptionEvents: string[];
}
