import { SquidApiQueryName } from '../../typeorm/squidDataSubscriptionStatus';
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

export class SquidSpace {
  id: string;
}

export class SquidPost {
  id: string;
  createdAtBlock?: string;
  summary?: string;
  body?: string;
  ownedByAccount?: SquidSubstrateAccount;
  rootPost?: SquidPost;
  parentPost?: SquidPost;
  kind?: SquidPostKind;
  inReplyToKind?: InReplyToKind;
  inReplyToPost?: SquidPost;
  space?: SquidSpace;
  extensions?: SquidContentExtension[];
}
export class SquidSubstrateAccount {
  id: string;
}
export class SquidEvmAccount {
  id: string;
}

export class SquidContentExtension {
  id: string;
  extensionSchemaId: SquidContentExtensionSchemaId;
  parentPost?: SquidPost;
  createdBy?: SquidSubstrateAccount;
  fromSubstrate?: SquidSubstrateAccount;
  fromEvm?: SquidEvmAccount;
  toSubstrate?: SquidSubstrateAccount;
  toEvm?: SquidEvmAccount;
  token?: string;
  amount?: string;
  decimals?: number;
  txHash?: string;
  chain?: string;
  collectionId?: string;
  nftId?: string;
  url?: string;
}

export class SquidActivitiesResponseDto {
  id: string;
  blockNumber: string;
  event: EventName;
  post?: SquidPost;
  account?: SquidSubstrateAccount;
  extension?: SquidContentExtension;
}

export class SquidNotificationsResponseDto {
  id: string;
  account: SquidSubstrateAccount;
  activity: SquidActivitiesResponseDto;
}

export type SquidSubscriptionResponseDto<Q extends SquidApiQueryName> =
  Q extends SquidApiQueryName.activities
    ? SquidActivitiesResponseDto
    : Q extends SquidApiQueryName.notifications
    ? SquidNotificationsResponseDto
    : never;

export class SquidSubscriptionNotificationsResponseDto {
  id: string;
  activity: {
    blockNumber: string;
  };
}

export class SquidSubscriptionsActivitiesResponseDto {
  id: string;
  blockNumber: string;
}
