import { CreateFarmerDto } from '../dto/create-farmer.dto';
import { FarmerResponseDto } from '../dto/farmer-response.dto';

export const FARMER_SERVICE_TOKEN = 'IFarmerService';

export interface IFarmerService {
  register(dto: CreateFarmerDto): Promise<FarmerResponseDto>;
}
