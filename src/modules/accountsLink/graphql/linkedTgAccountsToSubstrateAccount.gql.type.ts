import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class TelegramAccountDetails {
  @Field({ nullable: false })
  id: number;

  @Field({ nullable: false })
  userName: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;
}

@ObjectType('LinkedTgAccountsToSubstrateAccountGql')
export class LinkedTgAccountsToSubstrateAccountGqlType {
  @Field(() => [TelegramAccountDetails], { nullable: true })
  telegramAccounts: TelegramAccountDetails[];
}
