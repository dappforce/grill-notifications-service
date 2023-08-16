import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsValidSubstrateAddress } from '../../../../common/validators/validators';

@ObjectType()
@InputType()
export class UnlinkAddressWithTelegramAccountMessageInput {
  @Field({ nullable: false })
  @IsValidSubstrateAddress()
  substrateAddress: string;
}
