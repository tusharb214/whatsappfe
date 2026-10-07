 import { useCallback, useEffect, useState } from "react";
import {
  getMessagesByConversation,
  sendMessage as sendMessageApi,
  uploadWhatsAppMedia,
  sendMediaMessage as sendMediaMessageApi,
  type Message,
} from "../api/messageApi";

export interface MediaProgress {
  total: number;
  uploaded: number;
  sent: number;
  currentFile: string;
  phase: "idle" | "uploading" | "sending" | "completed";
}

export default function useMessages(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mediaProgress, setMediaProgress] =
    useState<MediaProgress>({
      total: 0,
      uploaded: 0,
      sent: 0,
      currentFile: "",
      phase: "idle",
    });

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getMessagesByConversation(conversationId);

      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // --------------------------------------------------
  // TEXT MESSAGE
  // --------------------------------------------------

  const sendMessage = async (messageText: string) => {
    if (!conversationId || !messageText.trim() || sending) {
      return false;
    }

    try {
      setSending(true);
      setError(null);

      const message = await sendMessageApi(
        conversationId,
        messageText.trim()
      );

      setMessages((previous) => [...previous, message]);

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message.");
      return false;
    } finally {
      setSending(false);
    }
  };

  // --------------------------------------------------
  // MEDIA TYPE
  // --------------------------------------------------

  const getMessageType = (
    file: File
  ): "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO" => {
    if (file.type.startsWith("image/")) {
      return "IMAGE";
    }

    if (file.type.startsWith("video/")) {
      return "VIDEO";
    }

    if (file.type.startsWith("audio/")) {
      return "AUDIO";
    }

    return "DOCUMENT";
  };

  // --------------------------------------------------
  // MULTIPLE MEDIA MESSAGE
  // --------------------------------------------------

  const sendMedia = async (
    files: File | File[],
    caption = ""
  ) => {
    if (!conversationId || sending) {
      return false;
    }

    const fileList = Array.isArray(files) ? files : [files];

    if (fileList.length === 0) {
      return false;
    }

    try {
      setSending(true);
      setError(null);

      setMediaProgress({
        total: fileList.length,
        uploaded: 0,
        sent: 0,
        currentFile: "",
        phase: "uploading",
      });

      let uploadedCount = 0;
      let sentCount = 0;

      // --------------------------------------------------
      // SEND FILES ONE BY ONE
      // --------------------------------------------------

      for (let index = 0; index < fileList.length; index++) {
        const file = fileList[index];

        // -----------------------------
        // Upload
        // -----------------------------

        setMediaProgress((previous) => ({
          ...previous,
          currentFile: file.name,
          phase: "uploading",
        }));

        const uploadResponse =
          await uploadWhatsAppMedia(file);

        uploadedCount++;

        setMediaProgress((previous) => ({
          ...previous,
          uploaded: uploadedCount,
          currentFile: file.name,
          phase: "sending",
        }));

        // -----------------------------
        // Detect message type
        // -----------------------------

        const messageType = getMessageType(file);

        // -----------------------------
        // Send to WhatsApp
        // -----------------------------

        const message = await sendMediaMessageApi(
          conversationId,
          uploadResponse.mediaId,
          messageType,
          file.name,
          caption.trim() || undefined
        );

        sentCount++;

        // Add message immediately
        setMessages((previous) => [
          ...previous,
          message,
        ]);

        setMediaProgress((previous) => ({
          ...previous,
          sent: sentCount,
          currentFile: file.name,
          phase:
            sentCount === fileList.length
              ? "completed"
              : "uploading",
        }));
      }

      return true;
    } catch (error) {
      console.error(
        "Failed to send media message:",
        error
      );

      setError("Failed to send media message.");

      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    error,
    refresh: loadMessages,
    sendMessage,
    sendMedia,
    mediaProgress,
  };
}