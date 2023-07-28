import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CommitSignedMessageResponseData {
  @Field({ nullable: true })
  tmpLinkingIdForTelegram?: string;
}

@ObjectType()
export class CommitSignedMessageResponse {
  @Field(() => CommitSignedMessageResponseData, { nullable: true })
  data?: CommitSignedMessageResponseData;

  @Field({ nullable: false })
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
