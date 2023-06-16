import { IsNotEmpty } from 'class-validator';
import {
  SquidSubscriptionExtension,
  SquidSubscriptionPost,
  SquidSubscriptionSubstrateAccount
} from '../../dataProviders/dto/squid/squidSubscriptionResponse.dto';
import {EventName} from "../../dataProviders/dto/squid/squidEvents.dto";

export class NotificationEventDataForSubstrateAccountDto {
  @IsNotEmpty()
  eventName: EventName; // TODO use generic events list
  substrateAccountId?: string;
  post?: SquidSubscriptionPost;
  account?: SquidSubscriptionSubstrateAccount;
  extension?: SquidSubscriptionExtension;
}

// export class NotificationEventByTgAccountDataDto {
//   @IsNotEmpty()
//   eventName: string;
//   tgAccountId?: number;
// }
