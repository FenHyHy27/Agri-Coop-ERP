import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'agri-coop-api',
      version: '1.0.0',
    };
  }
}
