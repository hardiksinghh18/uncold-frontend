import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

// 1. Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

// 2. Mock next/link to render a simple clickable anchor
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

// 3. Mock useAuth context
const mockSignInWithEmail = vi.fn();
const mockSignUpWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();
let mockUser: any = null;

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    signInWithEmail: mockSignInWithEmail,
    signUpWithEmail: mockSignUpWithEmail,
    signInWithGoogle: mockSignInWithGoogle,
    isLoading: false,
  }),
}));

describe("AuthSplitLayout Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  it("renders sign-in form correctly in signin mode", () => {
    render(<AuthSplitLayout mode="signin" />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@university.edu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("renders sign-up form correctly in signup mode", () => {
    render(<AuthSplitLayout mode="signup" />);

    expect(screen.getByRole("heading", { name: /get started with uncold/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@university.edu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 6 characters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create your account/i })).toBeInTheDocument();
  });

  it("validates short password and displays error before calling API", async () => {
    render(<AuthSplitLayout mode="signin" />);

    const emailInput = screen.getByPlaceholderText("name@university.edu");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /continue with email/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  it("calls signInWithEmail and redirects to /dashboard on success", async () => {
    mockSignInWithEmail.mockResolvedValueOnce({ error: null });

    render(<AuthSplitLayout mode="signin" />);

    const emailInput = screen.getByPlaceholderText("name@university.edu");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /continue with email/i });

    fireEvent.change(emailInput, { target: { value: "founder@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "securePassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith("founder@domain.com", "securePassword123");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays server error message when sign in fails", async () => {
    mockSignInWithEmail.mockResolvedValueOnce({ error: "Invalid login credentials." });

    render(<AuthSplitLayout mode="signin" />);

    const emailInput = screen.getByPlaceholderText("name@university.edu");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /continue with email/i });

    fireEvent.change(emailInput, { target: { value: "wrong@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongPassword" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
  });

  it("redirects authenticated user immediately to /dashboard", () => {
    mockUser = { id: "usr_999", email: "active@user.com" };

    render(<AuthSplitLayout mode="signin" />);

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
