import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Logger,
  RequestMethod,
} from '@nestjs/common';
import {
  PATH_METADATA,
  METHOD_METADATA,
  HTTP_CODE_METADATA,
} from '@nestjs/common/constants';
import { FarmerController } from './farmer.controller';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { FarmerResponseDto } from './dto/farmer-response.dto';
import {
  IFarmerService,
  FARMER_SERVICE_TOKEN,
} from './interfaces/farmer-service.interface';

describe('FarmerController (EP-02.2 Unit Tests)', () => {
  let controller: FarmerController;
  let mockFarmerService: jest.Mocked<IFarmerService>;

  const getValidCreateFarmerDto = (): CreateFarmerDto => {
    const dto = new CreateFarmerDto();
    dto.fullName = 'Nguyen Van Nong Dan';
    dto.email = 'farmer.coop@agri.vn';
    dto.password = 'SecurePassword123';
    dto.phone = '0912345678';
    dto.farmLocation = 'Thon 1, Xa Tan Tien, Tinh Lam Dong';
    dto.capacity = 250;
    return dto;
  };

  const getMockFarmerResponseDto = (): FarmerResponseDto => {
    return FarmerResponseDto.fromResult({
      user: {
        id: 'user-uuid-1234',
        email: 'farmer.coop@agri.vn',
        fullName: 'Nguyen Van Nong Dan',
        role: 'FARMER',
        createdAt: new Date('2026-11-18T00:00:00.000Z'),
      },
      profile: {
        id: 'farmer-profile-uuid-5678',
        phone: '0912345678',
        farmLocation: 'Thon 1, Xa Tan Tien, Tinh Lam Dong',
        capacity: 250,
        status: 'PENDING',
        joinDate: null,
        createdAt: new Date('2026-11-18T00:00:00.000Z'),
      },
    });
  };

  beforeEach(async () => {
    mockFarmerService = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmerController],
      providers: [
        {
          provide: FARMER_SERVICE_TOKEN,
          useValue: mockFarmerService,
        },
      ],
    }).compile();

    controller = module.get<FarmerController>(FarmerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. Controller should be properly instantiated and defined', () => {
    expect(controller).toBeDefined();
  });

  it('2. Should call FarmerService.register exactly once with exact forwarded payload', async () => {
    const dto = getValidCreateFarmerDto();
    const expectedResponse = getMockFarmerResponseDto();
    mockFarmerService.register.mockResolvedValueOnce(expectedResponse);

    const result = await controller.register(dto);

    // Verify service invocation count
    expect(mockFarmerService.register).toHaveBeenCalledTimes(1);

    // Verify exact forwarded payload
    expect(mockFarmerService.register).toHaveBeenCalledWith(dto);

    // Verify result returned from service is preserved
    expect(result).toEqual(expectedResponse);
  });

  it('3. Controller class should have correct @Controller("farmers") route metadata', () => {
    const controllerPath = Reflect.getMetadata(PATH_METADATA, FarmerController);
    expect(controllerPath).toBe('farmers');
  });

  it('4. Register endpoint should have correct @Post("register") route metadata', () => {
    const methodPath = Reflect.getMetadata(
      PATH_METADATA,
      FarmerController.prototype.register,
    );
    const httpMethod = Reflect.getMetadata(
      METHOD_METADATA,
      FarmerController.prototype.register,
    );

    expect(methodPath).toBe('register');
    expect(httpMethod).toBe(RequestMethod.POST);
  });

  it('5. Register endpoint should have @HttpCode(HttpStatus.CREATED) metadata (201)', () => {
    const statusCode = Reflect.getMetadata(
      HTTP_CODE_METADATA,
      FarmerController.prototype.register,
    );

    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(statusCode).toBe(201);
  });

  it('6. Should correctly propagate BadRequestException thrown from Service', async () => {
    const dto = getValidCreateFarmerDto();
    const badRequestError = new BadRequestException(
      'Validation failed at domain level',
    );
    mockFarmerService.register.mockRejectedValue(badRequestError);

    await expect(controller.register(dto)).rejects.toThrow(BadRequestException);
    await expect(controller.register(dto)).rejects.toThrow(
      'Validation failed at domain level',
    );
  });

  it('7. Should correctly propagate ConflictException thrown from Service (duplicate email/phone)', async () => {
    const dto = getValidCreateFarmerDto();
    const conflictError = new ConflictException(
      'Email or phone already registered',
    );
    mockFarmerService.register.mockRejectedValue(conflictError);

    await expect(controller.register(dto)).rejects.toThrow(ConflictException);
    await expect(controller.register(dto)).rejects.toThrow(
      'Email or phone already registered',
    );
  });

  it('8. Controller logging must NEVER leak raw passwords, emails, phone numbers, or PII', async () => {
    const dto = getValidCreateFarmerDto();
    const expectedResponse = getMockFarmerResponseDto();
    mockFarmerService.register.mockResolvedValueOnce(expectedResponse);

    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    try {
      await controller.register(dto);

      expect(logSpy).toHaveBeenCalled();
      const logCalls = logSpy.mock.calls.map((args) => args.join(' '));

      // Confirm generic event is logged
      expect(
        logCalls.some((msg) =>
          msg.includes('Farmer registration request received'),
        ),
      ).toBe(true);

      // Strictly ensure email, phone, and password (PII) are NEVER leaked into log output
      expect(logCalls.some((msg) => msg.includes(dto.email))).toBe(false);
      expect(logCalls.some((msg) => msg.includes(dto.phone))).toBe(false);
      expect(logCalls.some((msg) => msg.includes(dto.password))).toBe(false);
      expect(logCalls.some((msg) => msg.includes('farmer.coop@agri.vn'))).toBe(
        false,
      );
      expect(logCalls.some((msg) => msg.includes('0912345678'))).toBe(false);
      expect(logCalls.some((msg) => msg.includes('SecurePassword123'))).toBe(
        false,
      );
    } finally {
      logSpy.mockRestore();
    }
  });
});
