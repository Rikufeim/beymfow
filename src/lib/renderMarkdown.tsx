"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/chat.css";

export default function RenderMarkdown({ content }: { content: string }) {
  return (
    <div className="chat-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
