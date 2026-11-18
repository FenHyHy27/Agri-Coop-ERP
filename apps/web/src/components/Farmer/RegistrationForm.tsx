import { useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Typography,
} from "antd";

const { Title, Paragraph, Text } = Typography;

export interface RegistrationFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  farmLocation: string;
  capacity: number;
}

export interface RegistrationFormProps {
  onSubmit: (values: RegistrationFormValues) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * EP-02.4/02.6: Registration form with client-side validation.
 * API requests, notifications, and navigation are handled by RegisterPage.
 */
export function RegistrationForm({
  onSubmit,
  loading = false,
  disabled = false,
}: RegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const isBusy = submitting || loading;
  const isDisabled = disabled || isBusy;

  const handleFinish = async (
    values: RegistrationFormValues,
  ): Promise<void> => {
    if (disabled || loading || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 880,
        margin: "32px auto",
        borderRadius: 12,
        boxShadow: "0 8px 28px rgba(0, 58, 140, 0.08)",
      }}
    >
      <Title level={3} style={{ color: "#003a8c", marginTop: 0 }}>
        Đăng ký nông hộ
      </Title>
      <Paragraph type="secondary">
        Tạo tài khoản và cung cấp thông tin cơ sở chăn nuôi để gửi hồ sơ tham
        gia hợp tác xã.
      </Paragraph>

      <Form<RegistrationFormValues>
        name="farmerRegistration"
        layout="vertical"
        autoComplete="on"
        disabled={isDisabled}
        onFinish={handleFinish}
        requiredMark
      >
        <Divider orientation="left">Thông tin tài khoản</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập họ và tên",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                size="large"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: "Mật khẩu phải có chữ hoa, chữ thường và chữ số",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value: string | undefined) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Thông tin cơ sở chăn nuôi</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^0[35789]\d{8}$/,
                  message: "Số điện thoại phải gồm 10 chữ số với đầu số hợp lệ",
                },
              ]}
            >
              <Input
                size="large"
                type="tel"
                placeholder="0912345678"
                autoComplete="tel"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="capacity"
              label="Quy mô chuồng trại (số con tối đa)"
              rules={[
                { required: true, message: "Vui lòng nhập quy mô" },
                {
                  type: "number",
                  min: 1,
                  max: 2147483647,
                  message: "Quy mô phải từ 1 đến 2147483647",
                },
              ]}
            >
              <InputNumber
                size="large"
                min={1}
                max={2147483647}
                precision={0}
                placeholder="Ví dụ: 120"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="farmLocation"
          label="Địa chỉ trang trại"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập địa chỉ trang trại",
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Ấp / xã, huyện, tỉnh nơi đặt cơ sở chăn nuôi"
            autoComplete="street-address"
            showCount={false}
          />
        </Form.Item>

        <Paragraph style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Sau khi gửi đăng ký, hồ sơ sẽ ở trạng thái chờ xét duyệt.
          </Text>
        </Paragraph>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            aria-label="Đăng ký nông hộ"
            size="large"
            block
            loading={isBusy}
            disabled={isDisabled}
          >
            Đăng ký nông hộ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default RegistrationForm;
