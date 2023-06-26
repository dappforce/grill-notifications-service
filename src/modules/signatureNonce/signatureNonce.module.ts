import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureNonceService } from './services/signatureNonce.service';
import { SignatureNonce } from './typeorm/signatureNonce.entity';

@Global()
@Module({
  providers: [SignatureNonceService],
  imports: [TypeOrmModule.forFeature([SignatureNonce])],
  exports: [SignatureNonceService]
})
export class SignatureNonceModule {}
