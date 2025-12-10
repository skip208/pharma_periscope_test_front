import { useMemo, useState } from "react";
import type { AskResponse, Citation, ContextChunk, RawScore } from "../types";
import MarkdownViewer from "./MarkdownViewer";

interface AnswerCardProps {
  question: string;
  response: AskResponse;
  debugMode?: boolean;
}

function AnswerCard({ question, response, debugMode = false }: AnswerCardProps) {
  const [showFull, setShowFull] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const hasContext = useMemo(
    () =>
      debugMode &&
      ((response.context_chunks && response.context_chunks.length > 0) ||
        (response.raw_scores && response.raw_scores.length > 0)),
    [debugMode, response.context_chunks, response.raw_scores]
  );

  const renderCitations = (citations: Citation[]) =>
    citations.map((c) => {
      const hasChapterIndex = Number.isFinite(c.chapter_index);
      const chapterLabel = hasChapterIndex
        ? `Глава ${c.chapter_index}`
        : c.chapter_title
          ? `Глава: ${c.chapter_title}`
          : "Глава не указана";

      return (
        <li key={c.chunk_id} className="citation">
          <div className="citation__meta">
            <span className="citation__book">{c.book}</span>
            <span className="citation__chapter">{chapterLabel}</span>
            <span className="citation__pos">Позиция {c.position}</span>
          </div>
          <div className="citation__quote">
            <MarkdownViewer content={`> ${c.quote}`} />
          </div>
        </li>
      );
    });

  const renderContext = (chunks: ContextChunk[], scores: RawScore[]) => (
    <div className="context">
      {scores.length > 0 && (
        <div className="context__scores">
          <div className="context__scores-title">Оценки чанков</div>
          <ul className="context__scores-list">
            {scores.map((s) => (
              <li key={s.chunk_id}>
                <span className="context__chunk-id">{s.chunk_id}</span>
                <span className="context__score">{s.score.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {chunks.length > 0 && (
        <div className="context__chunks">
          {chunks.map((chunk) => (
            <details key={chunk.chunk_id} className="context__item">
              <summary>
                Чанк {chunk.chunk_id}
                {chunk.metadata?.title ? ` — ${String(chunk.metadata.title)}` : ""}
              </summary>
              <div className="context__text">
                <MarkdownViewer content={chunk.text} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );

  const { answer_short, answer_full, can_answer, citations, context_chunks, raw_scores } =
    response;

  return (
    <div className="answer-card">
      <div className="answer-card__question">
        <span className="answer-card__label">Вы:</span>
        <p className="answer-card__bubble answer-card__bubble--user">{question}</p>
      </div>

      <div className="answer-card__answer">
        <span className="answer-card__label">Бот:</span>
        <div
          className={`answer-card__bubble ${
            can_answer ? "answer-card__bubble--bot" : "answer-card__bubble--warn"
          }`}
        >
          <div className="answer-card__text">
            <MarkdownViewer content={answer_short} />
          </div>

          {can_answer && answer_full && (
            <div className="answer-card__controls">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowFull((v) => !v)}
              >
                {showFull ? "Скрыть полный ответ" : "Показать полный ответ"}
              </button>
            </div>
          )}

          {can_answer && answer_full && showFull && (
            <div className="answer-card__full">
              <MarkdownViewer content={answer_full} />
            </div>
          )}

          {citations.length > 0 && (
            <div className="answer-card__controls">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowCitations((v) => !v)}
              >
                {showCitations ? "Скрыть цитаты" : "Показать цитаты"}
              </button>
            </div>
          )}

          {showCitations && citations.length > 0 && (
            <ul className="citations">{renderCitations(citations)}</ul>
          )}

          {hasContext && (
            <div className="answer-card__controls">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowContext((v) => !v)}
              >
                {showContext ? "Скрыть контекст" : "Показать контекст"}
              </button>
            </div>
          )}

          {hasContext && showContext && renderContext(context_chunks, raw_scores)}
        </div>
      </div>
    </div>
  );
}

export default AnswerCard;

