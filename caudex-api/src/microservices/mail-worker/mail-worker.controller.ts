import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class MailWorkerController {
  private readonly logger = new Logger(MailWorkerController.name);

  @EventPattern('confirm.email')
  confirmEmail(@Payload() email: string, @Ctx() context: RmqContext): void {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`Send confirmation email to '${email}'`);

    channel.ack(originalMsg);
  }

  @EventPattern('reset.password')
  reset(@Payload() email: string, @Ctx() context: RmqContext): void {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log(`Send reset password email to '${email}'`);

    channel.ack(originalMsg);
  }
}
