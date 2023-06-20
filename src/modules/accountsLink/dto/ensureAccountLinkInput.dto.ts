export class EnsureAccountLinkInputDto {
  tgAccountId: number;
  tgAccountPhoneNumber: string;
  tgAccountUserName: string;
  tgAccountFirstName: string;
  tgAccountLastName: string;
  substrateAccountId: string;
  active?: boolean;
}
