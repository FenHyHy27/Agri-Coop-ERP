import axios from "axios";

export interface RegisterFarmerPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  farmLocation: string;
  capacity: number;
}

export type FarmerProfileStatus =
  "INCOMPLETE" | "PENDING" | "VERIFIED" | "REJECTED";

export type UserRole = "ADMIN" | "FARMER" | "VET";

export interface FarmerResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  profile: {
    id: string;
    phone: string;
    farmLocation: string;
    capacity: number;
    status: FarmerProfileStatus;
    joinDate: string | null;
    createdAt: string;
  };
}

/**
 * Date fields are ISO strings in JSON responses, not JavaScript Date objects.
 * The Vite development proxy forwards /api/v1 requests to the NestJS server.
 */
export const farmerApiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

export class FarmerRegistrationError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "FarmerRegistrationError";
    this.status = status;
  }
}

function getBackendMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }

  const message = data.message;

  if (typeof message === "string") {
    return message.trim() || undefined;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    return messages.length > 0 ? messages.join("; ") : undefined;
  }

  return undefined;
}

function defaultErrorMessage(status?: number): string {
  if (status === 400) {
    return "Thông tin đăng ký không hợp lệ.";
  }
  if (status === 409) {
    return "Email hoặc số điện thoại đã được đăng ký.";
  }
  if (status !== undefined && status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
}

/**
 * EP-02.5: API transport only. Form validation, notifications and navigation
 * are handled by RegisterPage in EP-02.6.
 */
export async function registerFarmer(
  payload: RegisterFarmerPayload,
): Promise<FarmerResponse> {
  // Only DTO fields are sent. In particular, never send confirmPassword.
  const requestBody: RegisterFarmerPayload = {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    farmLocation: payload.farmLocation,
    capacity: payload.capacity,
  };

  try {
    const response = await farmerApiClient.post<FarmerResponse>(
      "/farmers/register",
      requestBody,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        getBackendMessage(error.response?.data) ?? defaultErrorMessage(status);
      throw new FarmerRegistrationError(message, status);
    }

    throw new FarmerRegistrationError(
      "Đăng ký không thành công. Vui lòng thử lại.",
    );
  }
}
