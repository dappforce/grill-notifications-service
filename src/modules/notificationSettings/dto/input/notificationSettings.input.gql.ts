import { InputType, Field, ID } from '@nestjs/graphql';
import { MinLength, IsDateString, IsUUID } from 'class-validator';

@InputType()
export class NotificationSubscriptionInputType {
  @Field({ nullable: false })
  eventName: string;

  @Field({ nullable: false })
  telegramBot: boolean;

  @Field({ nullable: false })
  fcm: boolean;
}

@InputType()
export class NotificationSettingsInputGql {
  @Field({ nullable: false })
  substrateAccountId: string;

  @Field((type) => [NotificationSubscriptionInputType])
  subscriptions: NotificationSubscriptionInputType[];
}
