import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('AccountsLinkingMessageTemplateGql')
export class AccountsLinkingMessageTemplateGqlType {
  @Field({ nullable: false })
  messageTpl: string;
}
