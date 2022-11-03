import { Test, TestingModule } from '@nestjs/testing';
import { MailWorkerController } from './mail-worker.controller';

describe('MailWorkerController', () => {
  let controller: MailWorkerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailWorkerController],
    }).compile();

    controller = module.get<MailWorkerController>(MailWorkerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
