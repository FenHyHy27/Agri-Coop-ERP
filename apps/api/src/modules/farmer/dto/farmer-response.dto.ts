export type FarmerProfileStatus =
  'INCOMPLETE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export class FarmerProfileResponseDto {
  id!: string;
  phone!: string;
  farmLocation!: string;
  capacity!: number;
  status!: FarmerProfileStatus;
  joinDate!: Date | null;
  createdAt!: Date;
}

export class FarmerResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: string;
  createdAt!: Date;
  profile!: FarmerProfileResponseDto;

  /**
   * Explicit factory method to map User and FarmerProfile entities to a clean response DTO.
   * Ensures internal and sensitive fields like passwordHash and secrets are strictly excluded.
   */
  static fromResult(params: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      createdAt: Date;
      passwordHash?: string | null;
    };
    profile: {
      id: string;
      phone: string;
      farmLocation: string;
      capacity: number;
      status: FarmerProfileStatus;
      joinDate?: Date | null;
      createdAt: Date;
    };
  }): FarmerResponseDto {
    const dto = new FarmerResponseDto();
    dto.id = params.user.id;
    dto.email = params.user.email;
    dto.fullName = params.user.fullName;
    dto.role = params.user.role;
    dto.createdAt = params.user.createdAt;

    dto.profile = {
      id: params.profile.id,
      phone: params.profile.phone,
      farmLocation: params.profile.farmLocation,
      capacity: params.profile.capacity,
      status: params.profile.status,
      joinDate: params.profile.joinDate ?? null,
      createdAt: params.profile.createdAt,
    };

    return dto;
  }
}
