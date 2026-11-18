import { AxiosError, AxiosHeaders } from "axios";
import type { AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  farmerApiClient,
  FarmerRegistrationError,
  registerFarmer,
} from "./farmerService";
import type { FarmerResponse, RegisterFarmerPayload } from "./farmerService";

const payload: RegisterFarmerPayload = {
  fullName: "Nguyen Van A",
  email: "farmer@example.com",
  password: "SecurePassword123",
  phone: "0912345678",
  farmLocation: "Ap 1, Xa Tan Tien",
  capacity: 120,
};

const registeredFarmer: FarmerResponse = {
  id: "user-123",
  email: payload.email,
  fullName: payload.fullName,
  role: "FARMER",
  createdAt: "2026-11-18T12:00:00.000Z",
  profile: {
    id: "profile-456",
    phone: payload.phone,
    farmLocation: payload.farmLocation,
    capacity: payload.capacity,
    status: "PENDING",
    joinDate: null,
    createdAt: "2026-11-18T12:00:00.000Z",
  },
};

function makeSuccessResponse(): AxiosResponse<FarmerResponse> {
  return {
    data: registeredFarmer,
    status: 201,
    statusText: "Created",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

function makeHttpError(status: number, message?: unknown): AxiosError {
  return new AxiosError("Request failed", undefined, undefined, undefined, {
    data: message === undefined ? {} : { message },
    status,
    statusText: "Request failed",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("farmerService (EP-02.5)", () => {
  it("configures the API base URL and credentials", () => {
    expect(farmerApiClient.defaults.baseURL).toBe("/api/v1");
    expect(farmerApiClient.defaults.withCredentials).toBe(true);
  });

  it("posts the registration DTO and returns the backend response", async () => {
    const postSpy = vi
      .spyOn(farmerApiClient, "post")
      .mockResolvedValue(makeSuccessResponse());

    await expect(registerFarmer(payload)).resolves.toEqual(registeredFarmer);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith("/farmers/register", payload);
    expect(registeredFarmer.profile.joinDate).toBeNull();
  });

  it("does not send confirmPassword to the backend", async () => {
    const postSpy = vi
      .spyOn(farmerApiClient, "post")
      .mockResolvedValue(makeSuccessResponse());
    const formValues = { ...payload, confirmPassword: payload.password };

    await registerFarmer(formValues);

    expect(postSpy).toHaveBeenCalledWith("/farmers/register", payload);
    expect(postSpy.mock.calls[0]?.[1]).not.toHaveProperty("confirmPassword");
  });

  it("extracts validation messages from HTTP 400 responses", async () => {
    vi.spyOn(farmerApiClient, "post").mockRejectedValue(
      makeHttpError(400, ["Invalid email", "Invalid phone"]),
    );

    await expect(registerFarmer(payload)).rejects.toMatchObject({
      name: "FarmerRegistrationError",
      status: 400,
      message: "Invalid email; Invalid phone",
    });
  });

  it("extracts a single backend message from HTTP 409 responses", async () => {
    vi.spyOn(farmerApiClient, "post").mockRejectedValue(
      makeHttpError(409, "Email or phone already registered"),
    );

    await expect(registerFarmer(payload)).rejects.toMatchObject({
      status: 409,
      message: "Email or phone already registered",
    });
  });

  it("provides a friendly fallback for HTTP 500 without a message", async () => {
    vi.spyOn(farmerApiClient, "post").mockRejectedValue(makeHttpError(500));

    await expect(registerFarmer(payload)).rejects.toMatchObject({
      status: 500,
      message: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
    });
  });

  it("handles network errors without exposing transport details", async () => {
    vi.spyOn(farmerApiClient, "post").mockRejectedValue(
      new AxiosError("Network Error", AxiosError.ERR_NETWORK),
    );

    await expect(registerFarmer(payload)).rejects.toMatchObject({
      message: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
    });
  });

  it("wraps unexpected errors in a stable error type", async () => {
    vi.spyOn(farmerApiClient, "post").mockRejectedValue(
      new Error("Unexpected transport failure"),
    );

    await expect(registerFarmer(payload)).rejects.toBeInstanceOf(
      FarmerRegistrationError,
    );
  });
});
