import React from "react";
import { Layout, Typography, Card, Space, Tag, Row, Col, Button } from "antd";
import { Link, Route, Routes } from "react-router-dom";
import RegisterPage, { RegistrationSuccessPage } from "./pages/RegisterPage";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#003a8c",
          padding: "0 24px",
        }}
      >
        <Title level={3} style={{ color: "#ffffff", margin: 0 }}>
          Agri-Coop ERP
        </Title>
        <Link to="/register" style={{ marginLeft: "auto" }}>
          <Button type="primary">Đăng ký nông hộ</Button>
        </Link>
      </Header>

      <Content
        style={{
          padding: "40px 24px",
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card
            variant="borderless"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              borderRadius: 8,
            }}
          >
            <Title level={2} style={{ color: "#003a8c", marginBottom: 8 }}>
              Agri-Coop ERP
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              Hệ thống Hoạch định Nguồn lực Doanh nghiệp dành cho Hợp tác xã
              Chăn nuôi
            </Paragraph>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} sm={12}>
                <Card type="inner" title="Trạng thái Nền tảng (Milestone 0)">
                  <Space direction="vertical">
                    <div>
                      <Text strong>Backend API: </Text>
                      <Tag color="green">NestJS 10.4</Tag>
                    </div>
                    <div>
                      <Text strong>Frontend Web: </Text>
                      <Tag color="cyan">React 18 + Vite</Tag>
                    </div>
                    <div>
                      <Text strong>Giao diện UI: </Text>
                      <Tag color="blue">Ant Design 5.x</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card type="inner" title="Hạ tầng Dịch vụ CSDL">
                  <Space direction="vertical">
                    <div>
                      <Text strong>RDBMS: </Text>
                      <Tag color="purple">PostgreSQL 15 (Port 5433)</Tag>
                    </div>
                    <div>
                      <Text strong>NoSQL & Logs: </Text>
                      <Tag color="gold">MongoDB 6.0 (Port 27018)</Tag>
                    </div>
                    <div>
                      <Text strong>Cache: </Text>
                      <Tag color="red">Redis 7.2 (Port 6380)</Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Space>
      </Content>

      <Footer style={{ textAlign: "center", background: "transparent" }}>
        Agri-Coop ERP © {new Date().getFullYear()} - Nền tảng Nông nghiệp Số HTX
        Chăn nuôi
      </Footer>
    </Layout>
  );
};

export const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/register/success" element={<RegistrationSuccessPage />} />
  </Routes>
);

export default App;
