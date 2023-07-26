import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsValidSubstrateAddress } from '../../../../common/validators/validators';

@ObjectType()
@InputType()
export class DeleteFcmTokenFromAddressMessageInput {
  @Field({ nullable: false })
  @IsValidSubstrateAddress()
  substrateAddress: string;

  @Field({ nullable: false })
  fcmToken: string;
}
