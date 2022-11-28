import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { getRabbitMQConfig } from './microservices/rabbitmq.helper';
import { PrismaService } from './prisma.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Basic security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('APP_HOST'),
    credentials: true,
  });

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
    .addCookieAuth()
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
