import { useEffect, useState } from "react";
import { reindex } from "../api";
import type { ReindexRequest, ReindexResponse } from "../types";
import { Banner } from "../components";
import "./AdminPage.css";

interface Props {
  onBack: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

function AdminPage({ onBack }: Props) {
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [lastResult, setLastResult] = useState<ReindexResponse | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_token");
      if (saved) {
        setAdminToken(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async () => {
    if (!adminToken.trim()) {
      setStatus("error");
      setMessage("Введите X-Admin-Token");
      return;
    }

    setStatus("loading");
    setMessage("");
    setLastResult(null);

    try {
      const payload: ReindexRequest = { mode: "full" };
      const res = await reindex(payload, adminToken.trim());
      setLastResult(res);
      setStatus("success");
      setMessage(`Проиндексировано ${res.indexed_chunks} чанков за ${res.elapsed_sec} с`);
      try {
        localStorage.setItem("admin_token", adminToken.trim());
      } catch {
        // ignore
      }
    } catch (err) {
      setStatus("error");
      setMessage("Ошибка при переиндексации. Проверьте токен и попробуйте снова.");
      console.error(err);
    }
  };

  return (
    <div className="admin">
      <header className="admin__header">
        <div>
          <p className="app__eyebrow">Админка</p>
          <h1 className="app__title">Переиндексация корпуса</h1>
          <p className="app__subtitle">
            POST /admin/reindex с заголовком X-Admin-Token. В dev токен можно хранить
            в localStorage.
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={onBack}>
          ← Назад к чату
        </button>
      </header>

      <main className="admin__main">
        <div className="card">
          <label className="admin__label">
            X-Admin-Token
            <input
              type="password"
              className="admin__input"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Введите токен"
            />
          </label>

          <button
            className="button"
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Выполняю..." : "Переиндексировать"}
          </button>

          {status === "success" && (
            <Banner variant="success">
              {message || "Переиндексация выполнена"}
              {lastResult && (
                <div className="admin__stats">
                  <span>Статус: {lastResult.status}</span>
                  <span>Чанков: {lastResult.indexed_chunks}</span>
                  <span>Время: {lastResult.elapsed_sec} с</span>
                </div>
              )}
            </Banner>
          )}

          {status === "error" && (
            <Banner variant="error" onClose={() => setStatus("idle")}>
              {message}
            </Banner>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;

