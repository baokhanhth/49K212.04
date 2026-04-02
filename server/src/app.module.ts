import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LichSanModule } from './lich-san/lich-san.module';
import { SanBaiModule } from './san-bai/san-bai.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatSanModule } from './dat-san/dat-san.module';
import { VeDienTuModule } from './ve-dien-tu/ve-dien-tu.module';
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '1433'), 10),
        username: configService.get<string>('DB_USERNAME', 'sa'),
        password: configService.get<string>('DB_PASSWORD', '123456'),
        database: configService.get<string>('DB_DATABASE', 'football_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        extra: {
          requestTimeout: 30000,
          connectionTimeout: 30000,
        },
      }),
    }),

    SanBaiModule,
    LichSanModule,
    DatSanModule,
    VeDienTuModule,
    NguoiDungModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
