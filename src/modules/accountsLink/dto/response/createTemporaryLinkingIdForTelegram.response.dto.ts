import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateTemporaryLinkingIdForTelegramResponseDto {
  @Field({ nullable: false })
  id: string;
}
