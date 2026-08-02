import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
  intent?: string;
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm your retail assistant. Ask me about shipping, returns, payments, warranty, or offers." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage() {
    const message = input.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await api.post("/chat", { message });
      setMessages((prev) => [...prev, { role: "bot", text: data.answer, intent: data.intent }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong on my end." }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <DashboardLayout title="FAQ Chatbot">
      <Card className="flex flex-col h-[70vh] p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-sm ${
                    m.role === "user"
                      ? "bg-gradient-brand text-white rounded-br-md"
                      : "glass-panel rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-heading font-semibold shrink-0">
                    {user ? initials(user.name) : <UserIcon className="h-4 w-4" />}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <div className="flex items-end gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="glass-panel rounded-3xl rounded-bl-md">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-white/30 dark:border-white/10 p-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about shipping, returns, offers…"
            className="flex-1 px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="h-11 w-11 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-glow"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
