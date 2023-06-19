import { ObjectType, Field, ID, Int } from '@nestjs/graphql';


@ObjectType('AccountsLinkingMessageTemplateGql')
export class AccountsLinkingMessageTemplateGqlType {
  @Field({ nullable: false })
  messageTpl: string;
}
