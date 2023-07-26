import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('SignedMessageWithActionTemplateResponseDto')
export class SignedMessageWithActionTemplateResponseDto {
  @Field({ nullable: false })
  messageTpl: string;
}
