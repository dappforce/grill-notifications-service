export class EnsureAccountLinkInputDto {
  tgAccountId: number;
  tgAccountUserName: string;
  tgAccountFirstName: string;
  tgAccountLastName: string;
  substrateAccountId: string;
  active?: boolean;
}
