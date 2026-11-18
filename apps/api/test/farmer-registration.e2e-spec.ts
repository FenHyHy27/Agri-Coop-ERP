import {
  ConflictException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FARMER_SERVICE_TOKEN } from '../src/modules/farmer/interfaces/farmer-service.interface';
import { PrismaService } from '../src/prisma/prisma.service';

// HTTP wiring test. The service and database are mocked; persistence and
// rollback must be verified separately against an isolated test database.
describe('Farmer Registration HTTP contract', () => {
  let app: INestApplication;
  const register = jest.fn();
  const validPayload = {
    fullName: 'Nguyen Van A',
    email: 'farmer@example.com',
    password: 'SecurePassword123',
    phone: '0912345678',
    farmLocation: 'An Giang',
    capacity: 50,
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FARMER_SERVICE_TOKEN)
      .useValue({ register })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = testingModule.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => register.mockReset());

  afterAll(async () => {
    await app.close();
  });

  it('responds 201 with the public registration response', async () => {
    register.mockResolvedValue({
      id: 'user-id',
      email: validPayload.email,
      fullName: validPayload.fullName,
      role: 'FARMER',
      createdAt: '2026-11-18T00:00:00.000Z',
      profile: {
        id: 'profile-id',
        phone: validPayload.phone,
        farmLocation: validPayload.farmLocation,
        capacity: 50,
        status: 'PENDING',
        joinDate: null,
        createdAt: '2026-11-18T00:00:00.000Z',
      },
    });

    await request(app.getHttpServer())
      .post('/api/v1/farmers/register')
      .send(validPayload)
      .expect(201)
      .expect(({ body }) => {
        expect(body.role).toBe('FARMER');
        expect(body.profile.status).toBe('PENDING');
        expect(body).not.toHaveProperty('passwordHash');
      });

    expect(register).toHaveBeenCalledTimes(1);
  });

  it('responds 400 for an invalid registration body', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/farmers/register')
      .send({ ...validPayload, email: 'not-an-email' })
      .expect(400);
    expect(register).not.toHaveBeenCalled();
  });

  it('responds 409 for an existing email or phone', async () => {
    register.mockRejectedValue(
      new ConflictException('Email or phone already registered'),
    );
    await request(app.getHttpServer())
      .post('/api/v1/farmers/register')
      .send(validPayload)
      .expect(409);
  });
});
