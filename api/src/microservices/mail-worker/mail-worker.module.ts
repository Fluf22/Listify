import { Module } from '@nestjs/common';
import { MailWorkerController } from './mail-worker.controller';

@Module({
  controllers: [MailWorkerController],
})
export class MailWorkerModule {}
