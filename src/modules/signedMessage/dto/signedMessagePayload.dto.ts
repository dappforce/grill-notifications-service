import { LinkAddressWithTelegramAccountMessageInput } from './input/linkAddressWithTelegramAccountMessage.input';
import { UnlinkAddressWithTelegramAccountMessageInput } from './input/unlinkAddressWithTelegramAccountMessage.input';
import { AddFcmTokenToAddressMessageMessageInput } from './input/addFcmTokenToAddressMessage.input';
import { DeleteFcmTokenFromAddressMessageInput } from './input/deleteFcmTokenFromAddressMessage.input';

export type SignedMessagePayloadDto = Partial<
  LinkAddressWithTelegramAccountMessageInput &
    UnlinkAddressWithTelegramAccountMessageInput &
    AddFcmTokenToAddressMessageMessageInput &
    DeleteFcmTokenFromAddressMessageInput
>;
