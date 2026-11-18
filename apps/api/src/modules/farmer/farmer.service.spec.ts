import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { FarmerService } from './farmer.service';

jest.mock('argon2', () => ({
  argon2id: 2,
  hash: jest.fn(),
}));

describe('FarmerService (EP-02.3)', () => {
  let service: FarmerService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    farmerProfile: { findUnique: jest.Mock };
  };
  // Argon2 hash has overloads for string and raw Buffer output.
  const hashMock = argon2.hash as jest.Mock;

  const input = (): CreateFarmerDto => ({
    fullName: 'Nguyen Van A',
    email: 'farmer@example.com',
    password: 'SecurePassword123',
    phone: '0912345678',
    farmLocation: 'An Giang',
    capacity: 50,
  });

  const persistedUser = () => ({
    id: 'user-id',
    email: 'farmer@example.com',
    fullName: 'Nguyen Van A',
    role: 'FARMER' as const,
    passwordHash: '$argon2id$mock-hash',
    createdAt: new Date('2026-11-18T00:00:00.000Z'),
    farmerProfile: {
      id: 'profile-id',
      phone: '0912345678',
      farmLocation: 'An Giang',
      capacity: 50,
      status: 'PENDING' as const,
      joinDate: null,
      createdAt: new Date('2026-11-18T00:00:00.000Z'),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(persistedUser()),
      },
      farmerProfile: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    hashMock.mockResolvedValue('$argon2id$mock-hash');
    service = new FarmerService(prisma as unknown as PrismaService);
  });

  it('returns a safe FarmerResponseDto from the created user and profile', async () => {
    const result = await service.register(input());

    expect(result).toMatchObject({
      id: 'user-id',
      email: 'farmer@example.com',
      role: 'FARMER',
      profile: {
        id: 'profile-id',
        status: 'PENDING',
        joinDate: null,
      },
    });
    expect(Object.keys(result)).not.toContain('passwordHash');
    expect(JSON.stringify(result)).not.toContain('mock-hash');
    expect(JSON.stringify(result)).not.toContain('SecurePassword123');
  });

  it('hashes the password using Argon2id and never persists plaintext', async () => {
    const dto = input();
    await service.register(dto);

    expect(hashMock).toHaveBeenCalledTimes(1);
    expect(hashMock).toHaveBeenCalledWith(dto.password, {
      type: argon2.argon2id,
    });
    const createPayload = prisma.user.create.mock.calls[0][0];
    expect(createPayload.data.passwordHash).toBe('$argon2id$mock-hash');
    expect(JSON.stringify(createPayload)).not.toContain(dto.password);
  });

  it('creates User and FarmerProfile atomically using one nested Prisma write', async () => {
    await service.register(input());

    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'farmer@example.com',
        passwordHash: '$argon2id$mock-hash',
        fullName: 'Nguyen Van A',
        role: 'FARMER',
        isActive: true,
        farmerProfile: {
          create: {
            phone: '0912345678',
            farmLocation: 'An Giang',
            capacity: 50,
            status: 'PENDING',
            joinDate: null,
          },
        },
      },
      include: { farmerProfile: true },
    });
  });

  it('normalizes contact fields before pre-check and persistence', async () => {
    const dto = input();
    dto.email = '  FARMER@Example.COM  ';
    dto.phone = '091 234-5678';
    dto.fullName = '  Nguyen Van A  ';
    dto.farmLocation = ' An Giang ';
    await service.register(dto);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'farmer@example.com' },
      select: { id: true },
    });
    expect(prisma.farmerProfile.findUnique).toHaveBeenCalledWith({
      where: { phone: '0912345678' },
      select: { id: true },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'farmer@example.com',
          fullName: 'Nguyen Van A',
          farmerProfile: {
            create: {
              phone: '0912345678',
              farmLocation: 'An Giang',
              capacity: 50,
              status: 'PENDING',
              joinDate: null,
            },
          },
        }),
      }),
    );
  });

  it('rejects duplicate email before hashing or writing', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });
    await expect(service.register(input())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(hashMock).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate phone before hashing or writing', async () => {
    prisma.farmerProfile.findUnique.mockResolvedValue({
      id: 'existing-profile',
    });
    await expect(service.register(input())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(hashMock).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it.each(['email', 'phone'])(
    'converts concurrent unique violation P2002 on %s to HTTP 409',
    async (field) => {
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.22.0',
          meta: { target: [field] },
        }),
      );

      await expect(service.register(input())).rejects.toBeInstanceOf(
        ConflictException,
      );
    },
  );

  it('propagates non-unique Prisma errors without misclassifying them as 409', async () => {
    const dbError = new Error('Unexpected database failure');
    prisma.user.create.mockRejectedValue(dbError);
    await expect(service.register(input())).rejects.toBe(dbError);
  });

  it('propagates read failures without attempting a create', async () => {
    const dbError = new Error('Read failed');
    prisma.user.findUnique.mockRejectedValue(dbError);
    await expect(service.register(input())).rejects.toBe(dbError);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects an unexpected null profile instead of returning incomplete data', async () => {
    prisma.user.create.mockResolvedValue({
      ...persistedUser(),
      farmerProfile: null,
    });
    await expect(service.register(input())).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
