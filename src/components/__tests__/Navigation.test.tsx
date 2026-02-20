import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navigation, Page } from "../Navigation";
import { THEME } from "../theme";
import "@testing-library/jest-dom";

describe("Navigation", () => {
  const mockSetPage = jest.fn();
  const defaultProps = {
    page: "home" as Page,
    setPage: mockSetPage,
    mode: "dry" as keyof typeof THEME.modes,
  };

  beforeEach(() => {
    mockSetPage.mockClear();
  });

  it("renders all navigation buttons with correct labels", () => {
    render(<Navigation {...defaultProps} />);

    expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /test form/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /workbench/i }),
    ).toBeInTheDocument();
  });

  it("calls setPage('home') when Home button is clicked", () => {
    render(<Navigation {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /home/i }));
    expect(mockSetPage).toHaveBeenCalledWith("home");
  });

  it("calls setPage('createUser') when Test Form button is clicked", () => {
    render(<Navigation {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /test form/i }));
    expect(mockSetPage).toHaveBeenCalledWith("createUser");
  });

  it("calls setPage('workbench') when Workbench button is clicked", () => {
    render(<Navigation {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /workbench/i }));
    expect(mockSetPage).toHaveBeenCalledWith("workbench");
  });

  it("applies active styling to Home button when page is 'home'", () => {
    render(<Navigation {...defaultProps} page="home" />);

    const homeButton = screen.getByRole("button", { name: /home/i });
    expect(homeButton).toHaveClass("bg-white/10");

    const theme = THEME.modes[defaultProps.mode];
    expect(homeButton).toHaveClass(theme.textColor);
  });

  it("applies active styling to Test Form button when page is 'createUser'", () => {
    render(<Navigation {...defaultProps} page="createUser" />);

    const testFormButton = screen.getByRole("button", { name: /test form/i });
    expect(testFormButton).toHaveClass("bg-white/10");

    const theme = THEME.modes[defaultProps.mode];
    expect(testFormButton).toHaveClass(theme.textColor);
  });

  it("does not apply active styling to Workbench button even if page is 'workbench'", () => {
    // This test documents the current behavior where Workbench lacks active styling logic
    render(<Navigation {...defaultProps} page="workbench" />);

    const workbenchButton = screen.getByRole("button", { name: /workbench/i });
    expect(workbenchButton).not.toHaveClass("bg-white/10");
  });

  it("updates active styling when mode changes", () => {
    const { rerender } = render(
      <Navigation {...defaultProps} page="home" mode="dry" />,
    );

    let homeButton = screen.getByRole("button", { name: /home/i });
    expect(homeButton).toHaveClass(THEME.modes.dry.textColor);

    rerender(<Navigation {...defaultProps} page="home" mode="live" />);
    homeButton = screen.getByRole("button", { name: /home/i });
    expect(homeButton).toHaveClass(THEME.modes.live.textColor);
  });
});
