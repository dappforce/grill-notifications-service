import { InputType, Field, ID } from '@nestjs/graphql';
import { MinLength, IsDateString, IsUUID } from 'class-validator';

@InputType()
export class NotificationSubscriptionInputType {
  @Field({ nullable: false })
  eventName: string;

  @Field({ nullable: false })
  telegramBot: boolean;
}

@InputType()
export class NotificationSettingsGqlInput {
  @Field({ nullable: false })
  substrateAccountId: string;

  @Field((type) => [NotificationSubscriptionInputType])
  subscriptions: NotificationSubscriptionInputType[];
}
