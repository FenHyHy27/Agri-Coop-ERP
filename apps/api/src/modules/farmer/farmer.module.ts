import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FarmerController } from './farmer.controller';
import { FarmerService } from './farmer.service';
import { FARMER_SERVICE_TOKEN } from './interfaces/farmer-service.interface';

@Module({
  imports: [PrismaModule],
  controllers: [FarmerController],
  providers: [
    FarmerService,
    { provide: FARMER_SERVICE_TOKEN, useExisting: FarmerService },
  ],
  exports: [FARMER_SERVICE_TOKEN],
})
export class FarmerModule {}
