import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateFarmerDto } from './create-farmer.dto';
import { FarmerResponseDto } from './farmer-response.dto';

describe('EP-02.1 Farmer Registration DTO Unit Tests', () => {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const getValidPayload = () => ({
    fullName: 'Nguyen Van Nong Dan',
    email: 'farmer.coop@agri.vn',
    password: 'SecurePassword123',
    phone: '0912345678',
    farmLocation: 'Thon 1, Xa Tan Tien, Tinh Lam Dong',
    capacity: 250,
  });

  const toDto = (payload: Record<string, unknown>): CreateFarmerDto => {
    return plainToInstance(CreateFarmerDto, payload);
  };

  it('1. Valid payload should pass validation and transform fields properly', async () => {
    const rawPayload = {
      fullName: '   Nguyen Van Nong Dan   ',
      email: '  FARMER.COOP@AGRI.VN  ',
      password: 'SecurePassword123',
      phone: '  091-234-5678  ',
      farmLocation: '   Thon 1, Xa Tan Tien, Tinh Lam Dong   ',
      capacity: '250',
    };

    const dto = toDto(rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.fullName).toBe('Nguyen Van Nong Dan');
    expect(dto.email).toBe('farmer.coop@agri.vn');
    expect(dto.password).toBe('SecurePassword123'); // Password must NOT be trimmed
    expect(dto.phone).toBe('0912345678');
    expect(dto.farmLocation).toBe('Thon 1, Xa Tan Tien, Tinh Lam Dong');
    expect(dto.capacity).toBe(250);
    expect(typeof dto.capacity).toBe('number');
  });

  it('2. Should reject payload with missing or empty fullName', async () => {
    const dtoEmpty = toDto({ ...getValidPayload(), fullName: '' });
    const errorsEmpty = await validate(dtoEmpty);
    expect(errorsEmpty.some((err) => err.property === 'fullName')).toBe(true);

    const dtoWhitespace = toDto({ ...getValidPayload(), fullName: '   ' });
    const errorsWhitespace = await validate(dtoWhitespace);
    expect(errorsWhitespace.some((err) => err.property === 'fullName')).toBe(
      true,
    );

    const dtoMissing = toDto({ ...getValidPayload(), fullName: undefined });
    const errorsMissing = await validate(dtoMissing);
    expect(errorsMissing.some((err) => err.property === 'fullName')).toBe(true);
  });

  it('3. Should reject payload with invalid email format', async () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'farmer@',
      'farmer@.com',
    ];

    for (const email of invalidEmails) {
      const dto = toDto({ ...getValidPayload(), email });
      const errors = await validate(dto);
      expect(errors.some((err) => err.property === 'email')).toBe(true);
    }
  });

  it('4. Should reject password shorter than 8 characters', async () => {
    const dto = toDto({ ...getValidPayload(), password: 'Pass1' });
    const errors = await validate(dto);

    const passwordError = errors.find((err) => err.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints?.minLength).toBeDefined();
  });

  it('5. Should reject password that lacks required complexity (uppercase, lowercase, number)', async () => {
    const weakPasswords = [
      'alllowercase123', // Missing uppercase
      'ALLUPPERCASE123', // Missing lowercase
      'NoNumbersAtAll!', // Missing number
    ];

    for (const password of weakPasswords) {
      const dto = toDto({ ...getValidPayload(), password });
      const errors = await validate(dto);
      const passwordError = errors.find((err) => err.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints?.matches).toBeDefined();
    }
  });

  it('6. Should accept valid 10-digit Vietnamese mobile phone numbers (03, 05, 07, 08, 09)', async () => {
    const validPhones = [
      '0912345678', // Viettel/VNPT/Mobi 09x
      '0868123456', // Viettel 086x
      '0701234567', // Mobifone 070x
      '0561234567', // Vietnamobile 056x
      '0387654321', // Viettel 038x
    ];

    for (const phone of validPhones) {
      const dto = toDto({ ...getValidPayload(), phone });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('7. Should reject invalid phone numbers (wrong prefix, wrong length, non-numeric)', async () => {
    const invalidPhones = [
      '0123456789', // 01x is not a valid 10-digit mobile prefix
      '091234567', // 9 digits
      '09123456789', // 11 digits
      '0243123456', // Landline prefix (024)
      '0912abc678', // Contains letters
    ];

    for (const phone of invalidPhones) {
      const dto = toDto({ ...getValidPayload(), phone });
      const errors = await validate(dto);
      const phoneError = errors.find((err) => err.property === 'phone');
      expect(phoneError).toBeDefined();
    }
  });

  it('8. Should normalize phone numbers containing whitespace and hyphens before validating', async () => {
    const formattedPhones = [
      { raw: '  091 234 5678  ', expected: '0912345678' },
      { raw: '091-234-5678', expected: '0912345678' },
      { raw: ' 038-765-4321 ', expected: '0387654321' },
      { raw: '070 123 4567', expected: '0701234567' },
    ];

    for (const item of formattedPhones) {
      const dto = toDto({ ...getValidPayload(), phone: item.raw });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.phone).toBe(item.expected);
    }
  });

  it('9. Should reject capacity equal to 0, negative numbers, or decimal values', async () => {
    const invalidCapacities = [0, -10, 15.5, 'abc', null];

    for (const capacity of invalidCapacities) {
      const dto = toDto({ ...getValidPayload(), capacity });
      const errors = await validate(dto);
      const capacityError = errors.find((err) => err.property === 'capacity');
      expect(capacityError).toBeDefined();
    }
  });

  it('10. Should reject empty or whitespace-only farmLocation', async () => {
    const dtoEmpty = toDto({ ...getValidPayload(), farmLocation: '' });
    const errorsEmpty = await validate(dtoEmpty);
    expect(errorsEmpty.some((err) => err.property === 'farmLocation')).toBe(
      true,
    );

    const dtoWhitespace = toDto({ ...getValidPayload(), farmLocation: '    ' });
    const errorsWhitespace = await validate(dtoWhitespace);
    expect(
      errorsWhitespace.some((err) => err.property === 'farmLocation'),
    ).toBe(true);
  });

  it('11. FarmerResponseDto must strictly exclude passwordHash and sensitive fields', () => {
    const mockInternalEntity = {
      user: {
        id: 'user-uuid-1234',
        email: 'farmer.coop@agri.vn',
        fullName: 'Nguyen Van Nong Dan',
        role: 'FARMER',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$secret_hash',
        createdAt: new Date('2026-11-18T00:00:00.000Z'),
      },
      profile: {
        id: 'farmer-profile-uuid-5678',
        phone: '0912345678',
        farmLocation: 'Thon 1, Xa Tan Tien, Tinh Lam Dong',
        capacity: 250,
        status: 'PENDING' as const,
        joinDate: null,
        createdAt: new Date('2026-11-18T00:00:00.000Z'),
      },
    };

    const responseDto = FarmerResponseDto.fromResult(mockInternalEntity);

    // 1. Typescript and runtime verification
    expect(responseDto.id).toBe(mockInternalEntity.user.id);
    expect(responseDto.email).toBe(mockInternalEntity.user.email);
    expect(responseDto.fullName).toBe(mockInternalEntity.user.fullName);
    expect(responseDto.role).toBe('FARMER');
    expect(responseDto.profile.id).toBe(mockInternalEntity.profile.id);
    expect(responseDto.profile.status).toBe('PENDING');
    expect(responseDto.profile.joinDate).toBeNull();

    // 2. Sensitive fields must be undefined on the object
    expect(
      (responseDto as unknown as Record<string, unknown>).passwordHash,
    ).toBeUndefined();
    expect(
      (responseDto as unknown as Record<string, unknown>).password,
    ).toBeUndefined();

    // 3. Serialized JSON must never contain passwordHash or password
    const jsonString = JSON.stringify(responseDto);
    expect(jsonString).not.toContain('passwordHash');
    expect(jsonString).not.toContain('secret_hash');
    expect(jsonString).not.toContain('argon2id');
  });

  it('12. ValidationPipe must reject payload containing unwhitelisted properties', async () => {
    const payloadWithMaliciousField = {
      ...getValidPayload(),
      role: 'ADMIN',
      unknownField: 'malicious_input',
    };

    await expect(
      validationPipe.transform(payloadWithMaliciousField, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // =========================================================================
  // HARDENED VALIDATION TESTS (PROMPT 03B)
  // =========================================================================

  it('13. Should accept capacity in both valid numeric and valid string format (250 and "250")', async () => {
    const dtoWithNumber = toDto({ ...getValidPayload(), capacity: 250 });
    const errorsNumber = await validate(dtoWithNumber);
    expect(errorsNumber.length).toBe(0);
    expect(dtoWithNumber.capacity).toBe(250);
    expect(typeof dtoWithNumber.capacity).toBe('number');

    const dtoWithString = toDto({ ...getValidPayload(), capacity: '250' });
    const errorsString = await validate(dtoWithString);
    expect(errorsString.length).toBe(0);
    expect(dtoWithString.capacity).toBe(250);
    expect(typeof dtoWithString.capacity).toBe('number');
  });

  it('14. Should strictly reject boolean values for capacity (true, false)', async () => {
    const dtoTrue = toDto({ ...getValidPayload(), capacity: true });
    const errorsTrue = await validate(dtoTrue);
    expect(errorsTrue.some((err) => err.property === 'capacity')).toBe(true);

    const dtoFalse = toDto({ ...getValidPayload(), capacity: false });
    const errorsFalse = await validate(dtoFalse);
    expect(errorsFalse.some((err) => err.property === 'capacity')).toBe(true);
  });

  it('15. Should strictly reject scientific notation strings for capacity ("1e3", "2.5e2")', async () => {
    const scientificNotations = ['1e3', '1E3', '2.5e2', '1e+5'];

    for (const val of scientificNotations) {
      const dto = toDto({ ...getValidPayload(), capacity: val });
      const errors = await validate(dto);
      expect(errors.some((err) => err.property === 'capacity')).toBe(true);
    }
  });

  it('16. Should strictly reject hexadecimal strings for capacity ("0x10", "0XFF")', async () => {
    const hexNotations = ['0x10', '0XFF', '0x1a'];

    for (const val of hexNotations) {
      const dto = toDto({ ...getValidPayload(), capacity: val });
      const errors = await validate(dto);
      expect(errors.some((err) => err.property === 'capacity')).toBe(true);
    }
  });

  it('17. Should strictly reject object and array inputs for capacity', async () => {
    const complexInputs = [{}, { value: 250 }, [], [250], ['250']];

    for (const val of complexInputs) {
      const dto = toDto({ ...getValidPayload(), capacity: val });
      const errors = await validate(dto);
      expect(errors.some((err) => err.property === 'capacity')).toBe(true);
    }
  });

  it('18. Should strictly reject capacity exceeding Number.MAX_SAFE_INTEGER', async () => {
    // 1. Number input beyond safe integer
    const dtoLargeNumber = toDto({
      ...getValidPayload(),
      capacity: Number.MAX_SAFE_INTEGER + 100,
    });
    const errorsLargeNumber = await validate(dtoLargeNumber);
    expect(errorsLargeNumber.some((err) => err.property === 'capacity')).toBe(
      true,
    );

    // 2. String input beyond safe integer (e.g. 20-digit string)
    const dtoStringBeyondSafe = toDto({
      ...getValidPayload(),
      capacity: `${Number.MAX_SAFE_INTEGER}999`,
    });
    const errorsStringBeyondSafe = await validate(dtoStringBeyondSafe);
    expect(
      errorsStringBeyondSafe.some((err) => err.property === 'capacity'),
    ).toBe(true);
  });

  it('19. ValidationPipe must reject payload when only role is added ("ADMIN")', async () => {
    const payloadWithRoleOnly = {
      ...getValidPayload(),
      role: 'ADMIN',
    };

    await expect(
      validationPipe.transform(payloadWithRoleOnly, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('20. ValidationPipe must reject payload when only unknownField is added', async () => {
    const payloadWithUnknownFieldOnly = {
      ...getValidPayload(),
      unknownField: 'malicious_input',
    };

    await expect(
      validationPipe.transform(payloadWithUnknownFieldOnly, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
