import { useState } from "react";
import { Alert, Button, Layout, Result, message } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import RegistrationForm from "../components/Farmer/RegistrationForm";
import type { RegistrationFormValues } from "../components/Farmer/RegistrationForm";
import {
  FarmerRegistrationError,
  registerFarmer,
} from "../services/farmerService";

const { Content } = Layout;

export function RegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (
    values: RegistrationFormValues,
  ): Promise<void> => {
    setErrorMessage(null);

    try {
      const farmer = await registerFarmer({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.phone.trim(),
        farmLocation: values.farmLocation.trim(),
        capacity: values.capacity,
      });

      messageApi.success("Đăng ký thành công. Hồ sơ đang chờ xét duyệt.");
      navigate("/register/success", {
        replace: true,
        state: { submitted: true, farmerName: farmer.fullName },
      });
    } catch (error: unknown) {
      const displayMessage =
        error instanceof FarmerRegistrationError
          ? error.status === 409
            ? "Email hoặc số điện thoại đã được đăng ký."
            : error.message
          : "Không thể hoàn tất đăng ký. Vui lòng thử lại.";

      setErrorMessage(displayMessage);
      messageApi.error(displayMessage);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {contextHolder}
      <Content style={{ width: "100%", padding: "16px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Link to="/">Agri-Coop ERP / Trang chủ</Link>
          {errorMessage && (
            <Alert
              type="error"
              role="alert"
              data-testid="registration-api-error"
              showIcon
              message={errorMessage}
              style={{ marginTop: 20 }}
            />
          )}
        </div>
        <RegistrationForm onSubmit={handleSubmit} />
      </Content>
    </Layout>
  );
}

interface RegistrationSuccessState {
  submitted?: boolean;
  farmerName?: string;
}

export function RegistrationSuccessPage() {
  const location = useLocation();
  const state = location.state as RegistrationSuccessState | null;

  if (!state?.submitted) {
    return <Navigate to="/register" replace />;
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Content style={{ maxWidth: 880, margin: "32px auto", width: "100%" }}>
        <Result
          status="success"
          title="Đăng ký thành công"
          subTitle={`Hồ sơ${state.farmerName ? ` của ${state.farmerName}` : ""} đang chờ xét duyệt. Bạn chưa phải là xã viên đã được xác minh.`}
          extra={
            <Link to="/">
              <Button type="primary">Về trang chủ</Button>
            </Link>
          }
        />
      </Content>
    </Layout>
  );
}

export default RegisterPage;
