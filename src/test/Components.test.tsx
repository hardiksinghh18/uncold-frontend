import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@supabase/supabase-js";
import { AppHeader } from "@/components/AppHeader";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { HistoryClient } from "@/app/history/HistoryClient";
import { MailboxClient } from "@/app/mailbox/MailboxClient";
import { ProfileClient } from "@/app/profile/ProfileClient";

const mockSignOut = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "hardik@gmail.com" },
    signOut: mockSignOut,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => "toast-id-1"),
  },
}));

const mockUser = {
  id: "user-123",
  email: "hardik@gmail.com",
  user_metadata: { full_name: "Hardik Singh" },
  app_metadata: { provider: "email" },
} as unknown as User;

const sampleEmails = Array.from({ length: 7 }).map((_, i) => ({
  id: `email-${i + 1}`,
  sender_email: "hardik@gmail.com",
  recipient_email: i % 2 === 0 ? `alex@company${i}.com` : `hr@acme.com`,
  subject: `Subject ${i + 1}`,
  body: `Body content ${i + 1}`,
  channel: i === 0 ? "dm" : i === 1 ? "wellfound" : "email",
  company_name: i % 2 === 0 ? `Company${i}` : "Acme",
  recipient_name: i % 2 === 0 ? "Alex" : "Hiring Team",
  sent_at: new Date(Date.now() - i * 60000).toISOString(),
  opened_at: i === 2 ? new Date().toISOString() : null,
  open_count: i === 2 ? 2 : 0,
  reply_detected_at: i === 3 ? new Date().toISOString() : null,
}));

describe("AppHeader Component", () => {
  it("renders Dashboard, Mailbox Engine, and Outreach History on left, and profile pill on right without Sign Out", () => {
    render(<AppHeader user={mockUser} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Mailbox Engine")).toBeInTheDocument();
    expect(screen.getByText("Outreach History")).toBeInTheDocument();
    expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
    expect(screen.getByText("Hardik Singh")).toBeInTheDocument();
    expect(screen.getByText("hardik@gmail.com")).toBeInTheDocument();
    expect(screen.queryByTitle("Sign Out")).not.toBeInTheDocument();
  });
});

describe("DashboardClient Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only 5 recent emails, View Full History CTA, and Connect Gmail nudge when disconnected", async () => {
    global.fetch = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("/api/gmail/status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ connected: false, connectedGmail: null }),
        } as Response);
      }
      if (u.includes("/api/emails/stats")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ emails: sampleEmails }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    }) as typeof fetch;

    render(<DashboardClient user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Showing 5 of 7")).toBeInTheDocument();
    });

    expect(screen.getByText("Connect Your Gmail to Send Cold Outreach")).toBeInTheDocument();
    expect(screen.getByText("Subject 1")).toBeInTheDocument();
    expect(screen.getByText("Subject 5")).toBeInTheDocument();
    expect(screen.queryByText("Subject 6")).not.toBeInTheDocument();
    expect(screen.getByText(/View Full History \(7\)/i)).toBeInTheDocument();
  });
});

describe("HistoryClient Component", () => {
  it("supports search filtering and switching to By Company / By Recruiter grouping", async () => {
    global.fetch = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("/api/emails/stats")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ emails: sampleEmails }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    }) as typeof fetch;

    render(<HistoryClient user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Subject 1")).toBeInTheDocument();
    });

    // Channel badges appear
    expect(screen.getByText("LinkedIn DM")).toBeInTheDocument();
    expect(screen.getByText("Wellfound")).toBeInTheDocument();

    // Switch to By Company view
    fireEvent.click(screen.getByText("By Company"));
    await waitFor(() => {
      expect(screen.getByText("3 touches")).toBeInTheDocument(); // Acme has 3 items (i=1,3,5)
    });

    // Search filters down to Subject 1
    const searchInput = screen.getByPlaceholderText(/Search by company, recruiter, subject/i);
    fireEvent.change(searchInput, { target: { value: "Subject 1" } });
    expect(screen.getByText("Subject 1")).toBeInTheDocument();
    expect(screen.queryByText("Subject 2")).not.toBeInTheDocument();
  });
});

describe("MailboxClient Component", () => {
  it("disables Send Cold Outreach when Gmail is not connected and hides email fields in DM mode", async () => {
    global.fetch = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("/api/gmail/status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ connected: false, connectedGmail: null }),
        } as Response);
      }
      if (u.includes("/api/profile")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ profile: null }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    }) as typeof fetch;

    render(<MailboxClient user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Connect Gmail to Send/i })).toBeDisabled();
    });

    // Switch to LinkedIn / Twitter DM mode
    fireEvent.click(screen.getByText("LinkedIn / Twitter DM"));
    expect(screen.queryByPlaceholderText(/recruiter@company.com/i)).not.toBeInTheDocument();
    expect(screen.getByText("Copy Message to Clipboard")).toBeInTheDocument();
  });
});

describe("ProfileClient Component", () => {
  it("displays location, resume link, and Sign Out button on the profile page", async () => {
    global.fetch = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("/api/profile")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              profile: {
                full_name: "Hardik Singh",
                email: "hardik@gmail.com",
                location: "Delhi, India",
                headline: "Full Stack Engineer",
                skills: ["React", "TypeScript"],
                portfolio_links: { resume_url: "https://drive.google.com/file/d/123/view" },
              },
            }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    }) as typeof fetch;

    render(<ProfileClient user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Delhi, India")).toBeInTheDocument();
    });

    expect(screen.getByText("Resume Link (Drive / Cloud)")).toBeInTheDocument();
    const signOutBtn = screen.getByTitle("Sign Out");
    fireEvent.click(signOutBtn);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
