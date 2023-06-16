import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsLinkService } from './services/accountsLink.service';
import { AccountsLink } from './typeorm/accountsLink.entity';

@Module({
  providers: [AccountsLinkService],
  imports: [TypeOrmModule.forFeature([AccountsLink])],
  exports: [AccountsLinkService]
})
export class AccountsLinkModule {}
