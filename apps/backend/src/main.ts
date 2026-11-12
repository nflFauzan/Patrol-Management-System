import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV !== 'production',
      bodyLimit: 10485760, // 10MB limit for image base64 uploads
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global API Prefix with Legacy PHP Compatibility Exclusions
  app.setGlobalPrefix('api/v1', {
    exclude: [
      'insert-presensi.php',
      'update-presensi.php',
      'insert_chief.php',
      'insert_komandan.php',
      'insert_driver.php',
      'insert_staf.php',
      'insert-panic.php',
      'cek.php',
      'serverside-presensi.php',
      'serverside-chief.php',
    ],
  });

  const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(`🚀 Patrol Backend API running on: http://localhost:${port}/api/v1`);
  logger.log(`📡 WebSocket Gateway initialized for real-time SOS & GPS`);
  logger.log(`=======================================================`);
}

bootstrap();
