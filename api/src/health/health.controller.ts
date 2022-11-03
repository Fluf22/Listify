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
import { RmqOptions, Transport } from '@nestjs/microservices';
import { getRabbitMQConfig } from '../microservices/rabbitmq.helper';
import { Decimal } from '@prisma/client/runtime/index-browser';
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
    private rabbitMQHealthIndicator: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.prismaHealthIndicator.isHealthy('database'),
      () => {
        const rabbitMQConfig = getRabbitMQConfig(this.configService);
        return this.rabbitMQHealthIndicator.pingCheck<RmqOptions>('rabbitMQ', {
          timeout: 5000,
          transport: Transport.RMQ,
          options: rabbitMQConfig.options,
        });
      },
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
