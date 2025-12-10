import { useState } from "react";
import "./App.css";
import RagBotPage from "./pages/RagBotPage";
import AdminPage from "./pages/AdminPage";

type Screen = "chat" | "admin";

function App() {
  const [screen, setScreen] = useState<Screen>("chat");

  return (
    <div className="app">
      <nav className="topnav">
        <div className="topnav__brand">LOTR RAG Bot</div>
        <div className="topnav__actions">
          <button
            className={`topnav__btn ${screen === "chat" ? "topnav__btn--active" : ""}`}
            onClick={() => setScreen("chat")}
            type="button"
          >
            Чат
          </button>
          <button
            className={`topnav__btn ${screen === "admin" ? "topnav__btn--active" : ""}`}
            onClick={() => setScreen("admin")}
            type="button"
          >
            Admin
          </button>
        </div>
      </nav>

      {screen === "chat" ? (
        <RagBotPage />
      ) : (
        <AdminPage onBack={() => setScreen("chat")} />
      )}
    </div>
  );
}

export default App;

