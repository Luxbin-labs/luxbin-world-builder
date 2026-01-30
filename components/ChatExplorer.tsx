"use client";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage, WorldData } from "@/lib/world-types";

interface Props {
  world: WorldData | null;
  onWorldUpdate: (newObjects: unknown[]) => void;
}

export default function ChatExplorer({ world, onWorldUpdate }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [world?.name]);

  const send = async () => {
    if (!input.trim() || !world || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, world }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      if (data.newObjects?.length) onWorldUpdate(data.newObjects);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Error exploring world. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!world) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-mono text-luxbin-gold font-bold mb-2 uppercase tracking-wider">
        Explore World
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-white/20 text-xs font-mono">Ask about the world to discover more...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-xs font-mono p-2 rounded-lg ${
            m.role === "user"
              ? "bg-luxbin-orange/10 text-luxbin-orange ml-4"
              : "bg-luxbin-purple/10 text-white/70 mr-4"
          }`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs font-mono text-white/30 p-2 animate-pulse">Exploring...</div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What's behind that mountain?"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-luxbin-purple/50"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-luxbin-purple hover:bg-luxbin-purple/80 disabled:opacity-30 rounded-lg text-xs font-mono text-white"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
