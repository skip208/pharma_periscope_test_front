import { useEffect, useMemo, useRef, useState } from "react";
import { askQuestion, getHealth, HttpError } from "../api";
import type { AskMode, AskResponse } from "../types";
import { AnswerCard, Banner, QuestionForm } from "../components";
import "./RagBotPage.css";

type HealthStatus = "unknown" | "online" | "offline";

interface QAItem {
  id: string;
  question: string;
  response: AskResponse;
  createdAt: string;
}

function RagBotPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<AskMode>("default");
  const [history, setHistory] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus>("unknown");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getHealth()
      .then((res) => setHealth(res.status === "ok" ? "online" : "offline"))
      .catch(() => setHealth("offline"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const isAskDisabled = useMemo(
    () => isLoading || question.trim().length === 0,
    [isLoading, question]
  );

  const getErrorMessage = (err: unknown) => {
    if (err instanceof HttpError) {
      const payload = err.payload as Record<string, unknown> | string | undefined;
      if (typeof payload === "string" && payload.trim().length > 0) return payload;
      if (payload && typeof payload === "object") {
        if (typeof payload.detail === "string") return payload.detail;
        if (typeof payload.message === "string") return payload.message;
      }
      return `Ошибка (${err.status}) при обращении к серверу.`;
    }
    if (err instanceof Error) return err.message;
    return "Ошибка при обращении к боту. Попробуйте позже.";
  };

  const handleSubmit = async () => {
    if (isAskDisabled) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await askQuestion({
        question: question.trim(),
        mode,
        max_context_chunks: 5
      });
      const item: QAItem = {
        id: crypto.randomUUID(),
        question: question.trim(),
        response,
        createdAt: new Date().toISOString()
      };
      setHistory((prev) => [...prev, item]);
      setQuestion("");
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="app__eyebrow">React + Vite + TypeScript</p>
          <h1 className="app__title">LOTR RAG Bot</h1>
          <p className="app__subtitle">
            Минимальный чат с вызовом /api/v1/ask и индикатором здоровья бэкенда.
          </p>
        </div>
        <HealthIndicator status={health} />
      </header>

      <main className="page__main">
        {error && (
          <Banner variant="error" onClose={() => setError(null)}>
            {error}
          </Banner>
        )}

        <div className="history">
          {history.length === 0 && (
            <div className="history__empty">Задайте первый вопрос.</div>
          )}

          {history.map((item) => (
            <AnswerCard
              key={item.id}
              question={item.question}
              response={item.response}
              debugMode={mode === "debug"}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="page__footer">
        <QuestionForm
          value={question}
          mode={mode}
          isLoading={isLoading}
          onChangeValue={setQuestion}
          onChangeMode={setMode}
          onSubmit={handleSubmit}
        />
      </footer>
    </div>
  );
}

function HealthIndicator({ status }: { status: HealthStatus }) {
  const label =
    status === "online"
      ? "online"
      : status === "offline"
        ? "offline"
        : "checking...";
  return (
    <div className="health">
      <span className={`health__dot health__dot--${status}`} />
      <span className="health__label">{label}</span>
    </div>
  );
}

export default RagBotPage;

