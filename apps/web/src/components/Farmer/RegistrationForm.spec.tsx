import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegistrationForm } from "./RegistrationForm";
import type { RegistrationFormValues } from "./RegistrationForm";

function fillRegistrationForm(): void {
  fireEvent.change(screen.getByLabelText("Họ và tên"), {
    target: { value: "Nguyen Van A" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "farmer@example.com" },
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
    target: { value: "Ap 1, Xa Tan Tien, Tinh Lam Dong" },
  });
  fireEvent.change(screen.getByRole("spinbutton"), {
    target: { value: "120" },
  });
}

describe("RegistrationForm (EP-02.4)", () => {
  it("renders every registration field and the submit button", () => {
    render(<RegistrationForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Họ và tên")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác nhận mật khẩu")).toBeInTheDocument();
    expect(screen.getByLabelText("Số điện thoại")).toBeInTheDocument();
    expect(screen.getByLabelText("Địa chỉ trang trại")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đăng ký nông hộ" }),
    ).toBeEnabled();
  });

  it("accepts user input in the form fields", () => {
    render(<RegistrationForm onSubmit={vi.fn()} />);
    fillRegistrationForm();

    expect(screen.getByLabelText("Họ và tên")).toHaveValue("Nguyen Van A");
    expect(screen.getByLabelText("Email")).toHaveValue("farmer@example.com");
    expect(screen.getByLabelText("Mật khẩu")).toHaveValue("SecurePassword123");
    expect(screen.getByLabelText("Xác nhận mật khẩu")).toHaveValue(
      "SecurePassword123",
    );
    expect(screen.getByLabelText("Số điện thoại")).toHaveValue("0912345678");
    expect(screen.getByLabelText("Địa chỉ trang trại")).toHaveValue(
      "Ap 1, Xa Tan Tien, Tinh Lam Dong",
    );
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "120",
    );
  });

  it("passes the complete form values to its parent", async () => {
    const onSubmit = vi.fn<(_values: RegistrationFormValues) => void>();
    render(<RegistrationForm onSubmit={onSubmit} />);
    fillRegistrationForm();

    fireEvent.click(screen.getByRole("button", { name: "Đăng ký nông hộ" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      fullName: "Nguyen Van A",
      email: "farmer@example.com",
      password: "SecurePassword123",
      confirmPassword: "SecurePassword123",
      phone: "0912345678",
      farmLocation: "Ap 1, Xa Tan Tien, Tinh Lam Dong",
      capacity: 120,
    });
  });

  it("disables the form while an asynchronous submission is in progress", async () => {
    let finishSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmission = resolve;
        }),
    );

    render(<RegistrationForm onSubmit={onSubmit} />);
    fillRegistrationForm();
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký nông hộ" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole("button", { name: "Đăng ký nông hộ" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Đăng ký nông hộ" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    finishSubmission?.();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Đăng ký nông hộ" }),
      ).toBeEnabled();
    });
  });

  it("honors external loading and disabled states", () => {
    const { rerender } = render(
      <RegistrationForm onSubmit={vi.fn()} loading />,
    );
    expect(
      screen.getByRole("button", { name: "Đăng ký nông hộ" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();

    rerender(<RegistrationForm onSubmit={vi.fn()} disabled />);
    expect(
      screen.getByRole("button", { name: "Đăng ký nông hộ" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("does not submit when required information is missing", async () => {
    const onSubmit = vi.fn();
    render(<RegistrationForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký nông hộ" }));

    expect(
      await screen.findByText("Vui lòng nhập họ và tên"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
