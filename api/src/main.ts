import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { PrismaService } from './prisma.service';
import {
  MicroserviceOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { X_CAUDEX_KEY } from './constants';
import { getRabbitMQConfig } from './microservices/rabbitmq.helper';
import { RolesGuard } from './auth/roles.guard';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Basic security
  app.use(helmet());
  app.enableCors();

  // API configuration
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // OpenAPI Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Caudex API')
    .setDescription('Provide data to the Caudex PWA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  // Setup Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Setup queue
  app.connectMicroservice<RmqOptions>(getRabbitMQConfig(configService), {
    inheritAppConfig: true,
  });

  // Start server
  await app.startAllMicroservices();
  await app.listen(3000);

  // Dev hot reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
