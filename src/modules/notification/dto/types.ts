import {AccountsLink} from "../../accountsLink/typeorm/accountsLink.entity";
import {NotificationSettings} from "../../notificationSettings/typeorm/notificationSettings.entity";

export type AccountNotificationData = AccountsLink & {
    notificationSettings: NotificationSettings;
};