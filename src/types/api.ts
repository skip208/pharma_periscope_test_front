export type AskMode = "default" | "short_only" | "debug";

export interface AskRequest {
  question: string;
  mode?: AskMode;
  max_context_chunks?: number;
}

export interface Citation {
  book: string;
  book_id: string;
  chapter_title: string;
  chapter_index: number;
  position: number;
  quote: string;
  chunk_id: string;
}

export interface ContextChunk {
  chunk_id: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface RawScore {
  chunk_id: string;
  score: number;
}

export interface AskResponse {
  answer_short: string;
  answer_full: string;
  can_answer: boolean;
  citations: Citation[];
  context_chunks: ContextChunk[];
  raw_scores: RawScore[];
}

export interface HealthResponse {
  status: string;
}

export interface ReindexRequest {
  mode: "full";
}

export interface ReindexResponse {
  status: string;
  indexed_chunks: number;
  elapsed_sec: number;
}

