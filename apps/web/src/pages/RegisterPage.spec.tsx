import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import {
  FarmerRegistrationError,
  registerFarmer,
} from "../services/farmerService";
import type { FarmerResponse } from "../services/farmerService";

vi.mock("../services/farmerService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/farmerService")>();
  return { ...actual, registerFarmer: vi.fn() };
});

const registeredFarmer: FarmerResponse = {
  id: "user-123",
  email: "farmer@example.com",
  fullName: "Nguyen Van A",
  role: "FARMER",
  createdAt: "2026-11-18T12:00:00.000Z",
  profile: {
    id: "profile-123",
    phone: "0912345678",
    farmLocation: "Ap 1, Xa Tan Tien",
    capacity: 120,
    status: "PENDING",
    joinDate: null,
    createdAt: "2026-11-18T12:00:00.000Z",
  },
};

function renderRegistrationPage() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <App />
    </MemoryRouter>,
  );
}

function fillValidRegistration() {
  fireEvent.change(screen.getByLabelText("Họ và tên"), {
    target: { value: "  Nguyen Van A  " },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "FARMER@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Mật khẩu"), {
    target: { value: "SecurePassword123" },
  });
  fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
    target: { value: "SecurePassword123" },
  });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), {
    target: { value: "0912345678" },
  });
  fireEvent.change(screen.getByLabelText("Địa chỉ trang trại"), {
    target: { value: "  Ap 1, Xa Tan Tien  " },
  });
  fireEvent.change(screen.getByRole("spinbutton"), {
    target: { value: "120" },
  });
}

function submitForm() {
  fireEvent.click(screen.getByRole("button", { name: "Đăng ký nông hộ" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterPage (EP-02.6)", () => {
  it("renders the registration route and required fields", () => {
    renderRegistrationPage();
    expect(screen.getByLabelText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("rejects an empty form without requesting the API", async () => {
    renderRegistrationPage();
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Họ và tên")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    expect(registerFarmer).not.toHaveBeenCalled();
  });

  it("rejects invalid email and phone formats", async () => {
    renderRegistrationPage();
    fillValidRegistration();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0123456789" },
    });
    submitForm();
    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Số điện thoại phải gồm 10 chữ số với đầu số hợp lệ",
      ),
    ).toBeInTheDocument();
    expect(registerFarmer).not.toHaveBeenCalled();
  });

  it("rejects a password that does not meet backend policy", async () => {
    renderRegistrationPage();
    fillValidRegistration();
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "weak" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
      target: { value: "weak" },
    });
    submitForm();
    expect(
      await screen.findByText("Mật khẩu phải có ít nhất 8 ký tự"),
    ).toBeInTheDocument();
    expect(registerFarmer).not.toHaveBeenCalled();
  });

  it("rejects a mismatched password confirmation", async () => {
    renderRegistrationPage();
    fillValidRegistration();
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
      target: { value: "AnotherPassword123" },
    });
    submitForm();
    expect(
      await screen.findByText("Mật khẩu xác nhận không khớp"),
    ).toBeInTheDocument();
    expect(registerFarmer).not.toHaveBeenCalled();
  });

  it("submits only backend DTO fields and navigates to pending confirmation", async () => {
    vi.mocked(registerFarmer).mockResolvedValue(registeredFarmer);
    renderRegistrationPage();
    fillValidRegistration();
    submitForm();

    await waitFor(() => expect(registerFarmer).toHaveBeenCalledTimes(1));
    expect(registerFarmer).toHaveBeenCalledWith({
      fullName: "Nguyen Van A",
      email: "farmer@example.com",
      password: "SecurePassword123",
      phone: "0912345678",
      farmLocation: "Ap 1, Xa Tan Tien",
      capacity: 120,
    });
    expect(await screen.findByText("Đăng ký thành công")).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn chưa phải là xã viên đã được xác minh/),
    ).toBeInTheDocument();
  });

  it("shows an accessible error when an account already exists", async () => {
    vi.mocked(registerFarmer).mockRejectedValue(
      new FarmerRegistrationError("Email or phone already registered", 409),
    );
    renderRegistrationPage();
    fillValidRegistration();
    submitForm();

    expect(
      await screen.findByTestId("registration-api-error"),
    ).toHaveTextContent("Email hoặc số điện thoại đã được đăng ký.");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows a friendly network error without navigating away", async () => {
    vi.mocked(registerFarmer).mockRejectedValue(
      new FarmerRegistrationError(
        "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
      ),
    );
    renderRegistrationPage();
    fillValidRegistration();
    submitForm();

    expect(
      await screen.findByTestId("registration-api-error"),
    ).toHaveTextContent("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
