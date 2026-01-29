import { useEffect, useState, useRef, useCallback } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { apiFetch } from "../lib/api";

export type CollaboratorUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  color: string;
  role: "viewer" | "editor";
};

export type Collaborator = {
  clientId: number;
  user: CollaboratorUser;
  isTyping: boolean;
};

export function useCollaboration(documentId: string) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());

  const typingTimeoutRef = useRef<number | null>(null);
  const isCurrentlyTypingRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    let hocuspocusProvider: HocuspocusProvider | null = null;

    async function connect() {
      try {
        const { token, user } = await apiFetch<{
          token: string;
          user: CollaboratorUser;
        }>(`/api/documents/${documentId}/collab-token`);

        if (cancelled) return;

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const wsUrl = apiUrl.replace(/^http/, "ws");

        hocuspocusProvider = new HocuspocusProvider({
          url: wsUrl,
          name: documentId,
          document: ydoc,
          token,
          onAuthenticated: () => {
            if (hocuspocusProvider) {
              hocuspocusProvider.setAwarenessField("user", user);
              hocuspocusProvider.setAwarenessField("isTyping", false);
            }
          },
          onConnect: () => {
            setIsConnected(true);
          },
          onDisconnect: () => {
            setIsConnected(false);
            setIsSynced(false);
          },
          onSynced: () => {
            setIsSynced(true);
          },
          onAwarenessUpdate: ({ states }) => {
            const users: Collaborator[] = [];
            const seenUserIds = new Set<string>();

            states.forEach((state) => {
              const user = state.user as CollaboratorUser | undefined;
              const isTyping = state.isTyping as boolean | undefined;
              const { clientId } = state;

              if (!user) return;

              if (seenUserIds.has(user.id)) return;
              seenUserIds.add(user.id);

              users.push({
                clientId,
                user,
                isTyping: isTyping || false,
              });
            });

            setCollaborators(users);
          },
        });

        setProvider(hocuspocusProvider);
      } catch (error) {
        console.error("Failed to connect to collaboration:", error);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (hocuspocusProvider) {
        hocuspocusProvider.destroy();
      }
    };
  }, [documentId, ydoc]);

  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!provider) return;

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping && !isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = true;
        provider.setAwarenessField("isTyping", true);
      }

      if (isTyping) {
        typingTimeoutRef.current = window.setTimeout(() => {
          isCurrentlyTypingRef.current = false;
          provider.setAwarenessField("isTyping", false);
        }, 2000);
      }
    },
    [provider],
  );

  const currentUser = provider
    ? (collaborators.find((c) => c.clientId === provider.awareness?.clientID)
        ?.user ?? null)
    : null;

  const otherCollaborators = collaborators.filter(
    (c) => c.user.id !== currentUser?.id,
  );

  return {
    provider,
    ydoc,
    isConnected,
    isSynced,
    collaborators,
    otherCollaborators,
    currentUser,
    setTyping,
  };
}
