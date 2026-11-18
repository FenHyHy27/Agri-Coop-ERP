import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders Agri-Coop ERP title properly", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    const headingElements = screen.getAllByText("Agri-Coop ERP");
    expect(headingElements.length).toBeGreaterThan(0);
  });

  it("renders Milestone 0 foundation indicators", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Trạng thái Nền tảng (Milestone 0)"),
    ).toBeInTheDocument();
    expect(screen.getByText("NestJS 10.4")).toBeInTheDocument();
  });
});
