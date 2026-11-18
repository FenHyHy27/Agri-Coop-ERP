import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { FarmerResponseDto } from './dto/farmer-response.dto';
import {
  IFarmerService,
  FARMER_SERVICE_TOKEN,
} from './interfaces/farmer-service.interface';

@Controller('farmers')
export class FarmerController {
  private readonly logger = new Logger(FarmerController.name);

  constructor(
    @Inject(FARMER_SERVICE_TOKEN)
    private readonly farmerService: IFarmerService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createFarmerDto: CreateFarmerDto,
  ): Promise<FarmerResponseDto> {
    // Generic operational logging without exposing PII (email, phone, password, body)
    this.logger.log('Farmer registration request received');

    return this.farmerService.register(createFarmerDto);
  }
}
