import { SquidApiSubscriptionQueryName } from '../../typeorm/squidDataSubscriptionStatus';
import { EventName } from './squidEvents.dto';

export const enum SquidContentExtensionSchemaId {
  subsocial_donations = 'subsocial_donations',
  subsocial_evm_nft = 'subsocial_evm_nft'
}

export const enum SquidPostKind {
  Comment = 'Comment',
  SharedPost = 'SharedPost',
  RegularPost = 'RegularPost'
}

export const enum InReplyToKind {
  Post = 'Post'
}

export class SquidSubscriptionSubstrateSpace {
  id: string;
}

export class SquidSubscriptionPost {
  id: string;
  createdAtBlock?: string;
  summary?: string;
  body?: string;
  ownedByAccount?: SquidSubscriptionSubstrateAccount;
  rootPost?: SquidSubscriptionPost;
  parentPost?: SquidSubscriptionPost;
  kind?: SquidPostKind;
  inReplyToKind?: InReplyToKind;
  inReplyToPost?: SquidSubscriptionPost;
  space?: SquidSubscriptionSubstrateSpace;
}
export class SquidSubscriptionSubstrateAccount {
  id: string;
}
export class SquidSubscriptionEvmAccount {
  id: string;
}

export class SquidSubscriptionExtension {
  id: string;
  extensionSchemaId: SquidContentExtensionSchemaId;
  parentPost?: SquidSubscriptionPost;
  createdBy?: SquidSubscriptionSubstrateAccount;
  fromSubstrate?: SquidSubscriptionSubstrateAccount;
  fromEvm?: SquidSubscriptionEvmAccount;
  toSubstrate?: SquidSubscriptionSubstrateAccount;
  toEvm?: SquidSubscriptionEvmAccount;
  token?: string;
  amount?: string;
  decimals?: number;
  txHash?: string;
  chain?: string;
  collectionId?: string;
  nftId?: string;
  url?: string;
}

export class SquidSubscriptionActivitiesResponseDto {
  id: string;
  blockNumber: string;
  event: EventName;
  post?: SquidSubscriptionPost;
  account?: SquidSubscriptionSubstrateAccount;
  extension?: SquidSubscriptionExtension;
}

export class SquidSubscriptionNotificationsResponseDto {
  id: string;
  account: SquidSubscriptionSubstrateAccount;
  activity: SquidSubscriptionActivitiesResponseDto;
}

export type SquidSubscriptionResponseDto<
  Q extends SquidApiSubscriptionQueryName
> = Q extends SquidApiSubscriptionQueryName.activities
  ? SquidSubscriptionActivitiesResponseDto
  : Q extends SquidApiSubscriptionQueryName.notifications
  ? SquidSubscriptionNotificationsResponseDto
  : never;
