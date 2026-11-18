import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure Global API Prefix per specifications
  const apiPrefix = configService
    .get<string>('API_PREFIX', '/api/v1')
    .replace(/^\//, '');
  app.setGlobalPrefix(apiPrefix);

  // Configure Global ValidationPipe with strict rules
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure CORS for web client
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(
    `Agri-Coop API application running on: http://localhost:${port}/${apiPrefix}`,
  );
}

bootstrap();
