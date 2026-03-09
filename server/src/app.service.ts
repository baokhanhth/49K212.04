import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Football Web API is running!',
      version: '1.0.0',
    };
  }
} 
