import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class TelegramAccountDetails {
  @Field({ nullable: false })
  accountId: string;

  @Field({ nullable: false })
  userName: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  phoneNumber: string;
}

@ObjectType('LinkedTgAccountsToSubstrateAccountResponseType')
export class LinkedTgAccountsToSubstrateAccountResponseType {
  @Field(() => [TelegramAccountDetails], { nullable: true })
  telegramAccounts: TelegramAccountDetails[];
}
