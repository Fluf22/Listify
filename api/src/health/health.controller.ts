import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma-health.indicator';
import { ApiTags } from '@nestjs/swagger';
import { RedisOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { getRabbitMQConfig } from '../microservices/rabbitmq.helper';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller({
  version: '1',
  path: 'health',
})
export class HealthController {
  constructor(
    private configService: ConfigService,
    private healthCheckService: HealthCheckService,
    private prismaHealthIndicator: PrismaHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private microserviceHealthIndicator: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.prismaHealthIndicator.isHealthy('database'),
      () => {
        const rabbitMQConfig = getRabbitMQConfig(this.configService);
        return this.microserviceHealthIndicator.pingCheck<RmqOptions>(
          'rabbitMQ',
          {
            timeout: 5000,
            transport: Transport.RMQ,
            options: rabbitMQConfig.options,
          },
        );
      },
      () =>
        this.microserviceHealthIndicator.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          timeout: 5000,
          options: {
            host: this.configService.get('REDIS_HOST'),
            port: parseInt(this.configService.get<string>('REDIS_PORT')),
            username: this.configService.get('REDIS_USERNAME'),
            password: this.configService.get('REDIS_PASSWORD'),
          },
        }),
      () =>
        this.diskHealthIndicator.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.5,
        }),
      () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 1024 * 1024 * 150),
      () =>
        this.memoryHealthIndicator.checkRSS('memory_rss', 1024 * 1024 * 150),
    ]);
  }
}
