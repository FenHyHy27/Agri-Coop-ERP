import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FarmerProfileStatus, Prisma, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { FarmerResponseDto } from './dto/farmer-response.dto';
import { IFarmerService } from './interfaces/farmer-service.interface';

const DUPLICATE_REGISTRATION_MESSAGE = 'Email or phone already registered';

@Injectable()
export class FarmerService implements IFarmerService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: CreateFarmerDto): Promise<FarmerResponseDto> {
    // Defensive normalization also covers non-HTTP callers of the service.
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.trim().replace(/[\s-]/g, '');

    const [existingUser, existingProfile] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.farmerProfile.findUnique({
        where: { phone },
        select: { id: true },
      }),
    ]);

    if (existingUser || existingProfile) {
      throw new ConflictException(DUPLICATE_REGISTRATION_MESSAGE);
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      // One nested write: User and FarmerProfile are committed atomically.
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.FARMER,
          isActive: true,
          farmerProfile: {
            create: {
              phone,
              farmLocation: dto.farmLocation.trim(),
              capacity: dto.capacity,
              status: FarmerProfileStatus.PENDING,
              joinDate: null,
            },
          },
        },
        include: { farmerProfile: true },
      });

      if (!user.farmerProfile) {
        throw new InternalServerErrorException('Farmer registration failed');
      }

      return FarmerResponseDto.fromResult({
        user,
        profile: user.farmerProfile,
      });
    } catch (error: unknown) {
      // Pre-checks cannot prevent simultaneous requests; the unique indexes
      // remain the final authority for uniqueness.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(DUPLICATE_REGISTRATION_MESSAGE);
      }
      throw error;
    }
  }
}
