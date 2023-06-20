import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class NotificationSubscription {
  @Field({ nullable: false })
  eventName: string;

  @Field({ nullable: false })
  telegramBot: boolean;
}

@ObjectType('NotificationSettingsGql')
export class NotificationSettingsGqlType {
  @Field({ nullable: false })
  substrateAccountId: string;

  @Field(() => NotificationSubscription)
  subscriptions: NotificationSubscription[];

  @Field(() => String)
  subscriptionEvents: string[];
}
