import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthHeaders } from "@/lib/api";
import type { JobMetadata } from "@/components/JobMetadataPanel";

export interface TrackedEmailRecord {
  id: string;
  sender_email?: string;
  recipient_email: string;
  subject: string;
  body?: string;
  channel?: "email" | "dm" | "wellfound" | string;
  company_name?: string | null;
  recipient_name?: string | null;
  job_title?: string | null;
  job_metadata?: JobMetadata | null;
  sent_at: string;
  opened_at: string | null;
  open_count: number;
  reply_detected_at: string | null;
}

export interface EmailStatsResponse {
  emails?: TrackedEmailRecord[];
}

export interface GmailStatusResponse {
  connected: boolean;
  connectedGmail: string | null;
}

export interface ProfileResponse {
  profile: any | null;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const uncoldApi = createApi({
  reducerPath: "uncoldApi",
  baseQuery: fetchBaseQuery({
    baseUrl: backendUrl,
    prepareHeaders: async (headers) => {
      const auth = await getAuthHeaders();
      if (auth.Authorization) {
        headers.set("Authorization", auth.Authorization);
      }
      return headers;
    },
  }),
  tagTypes: ["EmailStats", "GmailStatus", "Profile"],
  keepUnusedDataFor: 120,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getEmailStats: builder.query<EmailStatsResponse, string | undefined>({
      query: (email) =>
        email
          ? `/api/emails/stats?email=${encodeURIComponent(email)}`
          : "/api/emails/stats",
      providesTags: ["EmailStats"],
    }),

    syncEmailReplies: builder.mutation<{ success?: boolean; repliesFound?: number }, { email: string }>({
      query: (body) => ({
        url: "/api/emails/sync-replies",
        method: "POST",
        body,
      }),
      invalidatesTags: (_res) => (_res?.repliesFound ? ["EmailStats"] : []),
    }),

    getGmailStatus: builder.query<GmailStatusResponse, string>({
      query: (email) => `/api/gmail/status?email=${encodeURIComponent(email)}`,
      providesTags: ["GmailStatus"],
    }),

    getGmailConnectUrl: builder.query<{ url?: string; error?: string }, string>({
      query: (returnTo) =>
        `/api/gmail/connect?returnTo=${encodeURIComponent(returnTo)}&format=json`,
    }),

    getProfile: builder.query<ProfileResponse, string>({
      query: (email) => `/api/profile?email=${encodeURIComponent(email)}`,
      providesTags: ["Profile"],
    }),

    saveProfile: builder.mutation<{ success?: boolean; profile?: any; error?: string }, Record<string, any>>({
      query: (body) => ({
        url: "/api/profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    parseResume: builder.mutation<{ success?: boolean; data?: any; error?: string }, FormData>({
      query: (formData) => ({
        url: "/api/profile/parse-resume",
        method: "POST",
        body: formData,
      }),
    }),

    sendGmail: builder.mutation<
      { success?: boolean; messageId?: string; error?: string },
      {
        email?: string;
        to: string;
        subject: string;
        body: string;
        senderName?: string;
        companyName?: string;
        recipientName?: string;
        jobTitle?: string;
        jobMetadata?: JobMetadata;
      }
    >({
      query: (body) => ({
        url: "/api/gmail/send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailStats"],
    }),

    logOutreachCopy: builder.mutation<
      { success?: boolean; error?: string },
      {
        email: string;
        channel: string;
        companyName?: string;
        recipientName?: string;
        jobTitle?: string;
        jobMetadata?: JobMetadata;
        body: string;
      }
    >({
      query: (body) => ({
        url: "/api/outreach/log-copy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailStats"],
    }),
  }),
});

export const {
  useGetEmailStatsQuery,
  useSyncEmailRepliesMutation,
  useGetGmailStatusQuery,
  useLazyGetGmailConnectUrlQuery,
  useGetProfileQuery,
  useSaveProfileMutation,
  useParseResumeMutation,
  useSendGmailMutation,
  useLogOutreachCopyMutation,
} = uncoldApi;
