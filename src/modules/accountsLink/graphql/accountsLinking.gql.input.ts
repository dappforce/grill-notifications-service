import { InputType, Field, ID } from '@nestjs/graphql';
import { MinLength, IsDateString, IsUUID } from 'class-validator';

@InputType()
export class AccountsLinkingGqlInput {
  @Field({ nullable: false })
  substrateAccount: string;
}
