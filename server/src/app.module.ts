import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KhungGioModule } from './khung-gio/khung-gio.module';
import { LichSanModule } from './lich-san/lich-san.module';
import { SanBaiModule } from './san-bai/san-bai.module';
import { CauHinhModule } from './cau-hinh/cau-hinh.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatSanModule } from './dat-san/dat-san.module';

@Module({
  imports: [
    // Load .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Serve static file
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // Database connection - SQL Server
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '1433'), 10),
        username: configService.get<string>('DB_USERNAME', 'sa'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'football_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
        extra: {
          requestTimeout: 30000,
          connectionTimeout: 30000,
        },
      }),
    }),
    // Feature modules
    SanBaiModule,
    KhungGioModule,
    LichSanModule,
    CauHinhModule,
    FacilitiesModule,
    DatSanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}