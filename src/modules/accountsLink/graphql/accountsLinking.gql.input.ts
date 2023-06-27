import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AccountsLinkingGqlInput {
  @Field({ nullable: false })
  substrateAccount: string;
}
