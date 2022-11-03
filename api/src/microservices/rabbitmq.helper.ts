import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { X_CAUDEX_KEY } from '../constants';

export function getRabbitMQConfig(configService: ConfigService): RmqOptions {
  const rabbitMQHost = configService.get('RABBITMQ_HOST');
  const rabbitMQPort = configService.get('RABBITMQ_PORT');
  const rabbitMQUser = configService.get('RABBITMQ_DEFAULT_USER');
  const rabbitMQPassword = configService.get('RABBITMQ_DEFAULT_PASS');

  return {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${rabbitMQUser}:${rabbitMQPassword}@${rabbitMQHost}:${rabbitMQPort}`,
      ],
      queue: configService.get('RABBITMQ_MAIL_QUEUE'),
      noAck: false,
      queueOptions: {
        durable: true,
      },
      persistent: true,
      prefetchCount: 1,
      headers: {
        [X_CAUDEX_KEY]: configService.get('RABBITMQ_SECRET'),
      },
    },
  };
}
