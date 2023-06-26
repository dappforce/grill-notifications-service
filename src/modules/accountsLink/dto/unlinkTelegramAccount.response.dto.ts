import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UnlinkTelegramAccountResponseDto {
  @Field({ nullable: false })
  success: boolean;
  @Field({ nullable: true })
  message?: string;
}
