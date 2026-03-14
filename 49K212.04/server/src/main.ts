import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Quản Lý Đặt Sân - API')
    .setDescription('API documentation cho hệ thống quản lý đặt sân bóng đá')
    .setVersion('1.0')
    .addTag('khung-gio', 'Quản lý khung giờ hoạt động')
    .addTag('lich-san', 'Quản lý lịch hoạt động sân')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  //
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  

 
//
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📄 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
