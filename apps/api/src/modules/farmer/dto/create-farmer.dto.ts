import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFarmerDto {
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName!: string;

  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/[\s-]/g, '') : value,
  )
  @Matches(/^0[35789]\d{8}$/, {
    message:
      'Phone number must be a valid 10-digit Vietnamese mobile number (prefixes: 03, 05, 07, 08, 09)',
  })
  phone!: string;

  @IsString({ message: 'Farm location must be a string' })
  @IsNotEmpty({ message: 'Farm location is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  farmLocation!: string;

  @Transform(({ value }) => {
    // Reject non-primitive types and booleans without coercion
    if (
      typeof value === 'boolean' ||
      value === null ||
      value === undefined ||
      typeof value === 'object'
    ) {
      return value;
    }

    // Handle string inputs strictly
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Only strictly positive/zero digit sequences are valid decimal numbers
      if (/^\d+$/.test(trimmed)) {
        try {
          const bigVal = BigInt(trimmed);
          if (bigVal > BigInt(Number.MAX_SAFE_INTEGER)) {
            return Infinity;
          }
          return Number(trimmed);
        } catch {
          return value;
        }
      }
      return value;
    }

    // Handle number inputs
    if (typeof value === 'number') {
      if (!Number.isSafeInteger(value) && value > Number.MAX_SAFE_INTEGER) {
        return Infinity;
      }
      return value;
    }

    return value;
  })
  @IsNotEmpty({ message: 'Capacity is required' })
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(2147483647, { message: 'Capacity must not exceed 2147483647' })
  capacity!: number;
}
