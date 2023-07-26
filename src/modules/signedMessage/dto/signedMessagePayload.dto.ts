import { LinkAddressWithTelegramAccountMessageInput } from './input/linkAddressWithTelegramAccountMessage.input';
import { UnlinkAddressWithTelegramAccountMessageInput } from './input/unlinkAddressWithTelegramAccountMessage.input';

export type SignedMessagePayloadDto = Partial<
  LinkAddressWithTelegramAccountMessageInput &
    UnlinkAddressWithTelegramAccountMessageInput
>;
