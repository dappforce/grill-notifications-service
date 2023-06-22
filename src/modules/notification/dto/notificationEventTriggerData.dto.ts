import { IsNotEmpty } from 'class-validator';
import {
  SquidContentExtension,
  SquidPost,
  SquidSubstrateAccount
} from '../../dataProviders/dto/squid/squidResponse.dto';
import {EventName} from "../../dataProviders/dto/squid/squidEvents.dto";

export class NotificationEventDataForSubstrateAccountDto {
  @IsNotEmpty()
  eventName: EventName; // TODO use generic events list
  substrateAccountId?: string;
  post?: SquidPost;
  account?: SquidSubstrateAccount;
  extension?: SquidContentExtension;
}

// export class NotificationEventByTgAccountDataDto {
//   @IsNotEmpty()
//   eventName: string;
//   tgAccountId?: number;
// }
