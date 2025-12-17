import type { JSONContent } from "@tiptap/react";

export type TiptapDoc = JSONContent;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
};

export type Document = {
  id: string;
  ownerId: string;
  title: string;
  content: TiptapDoc;
  isPublic: boolean;
  publicToken: string | null;
  trashedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
};

export type SaveStatus = "idle" | "saving" | "saved";
