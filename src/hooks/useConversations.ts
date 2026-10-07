import { useCallback, useEffect, useState } from "react";
import {
  getConversations,
  type Conversation,
} from "../api/conversationApi";

export default function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: loadConversations,
  };
}