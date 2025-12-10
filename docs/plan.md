Ок, давай сделаем прям фронтовой roadmap под эти ручки.

⸻

Этап 0. Базовая настройка фронта

Цель: завести минимальное SPA, которое может дергать бэк.

Задачи:
	1.	стек:
	•	React + TypeScript + Vite.
	2.	Создать проект, добавить базовую структуру:
	•	src/api/
	•	src/components/
	•	src/pages/
	•	src/types/
	3.	В .env/.env.local завести:
	•	VITE_API_BASE_URL=http://localhost:8000
	4.	Добавить простой layout:
	•	шапка «LOTR RAG Bot»
	•	основной контейнер под чат / форму вопросов.

⸻

Этап 1. Типы данных под API

Цель: строго описать, что приходит/уходит в ручках.

Задачи:
	1.	В src/types/api.ts описать:

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
  status: string;           // "completed"
  indexed_chunks: number;
  elapsed_sec: number;
}


⸻

Этап 2. API-слой (работа с беком)

Цель: инкапсулировать вызовы /health, /api/v1/ask, /admin/reindex.

Задачи:
	1.	src/api/client.ts:
	•	создать const API_BASE = import.meta.env.VITE_API_BASE_URL.
	•	реализовать функцию request<T>(url, options): Promise<T> с обработкой ошибок HTTP.
	2.	src/api/endpoints.ts:
	•	getHealth(): Promise<HealthResponse>
	•	GET /health.
	•	askQuestion(payload: AskRequest): Promise<AskResponse>
	•	POST /api/v1/ask, Content-Type: application/json.
	•	reindex(payload: ReindexRequest, adminToken: string): Promise<ReindexResponse>
	•	POST /admin/reindex
	•	headers: Content-Type, X-Admin-Token.

⸻

Этап 3. Главная страница (чат/QA)

Цель: основной пользовательский интерфейс общения с ботом.

Задачи:
	1.	Страница RagBotPage (src/pages/RagBotPage.tsx):
	•	локальное состояние:

const [question, setQuestion] = useState("");
const [history, setHistory] = useState<QAItem[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [mode, setMode] = useState<AskMode>("default");

где QAItem:

interface QAItem {
  id: string;
  question: string;
  response: AskResponse;
  createdAt: string;
}


	2.	Верх страницы:
	•	Заголовок.
	•	Маленький индикатор /health:
	•	useEffect → getHealth();
	•	зелёная/красная точка + текст «online/offline».
	3.	Центральный блок:
	•	Лента истории (history.map) с компонентом AnswerCard для каждого QA.
	4.	Нижняя панель:
	•	QuestionForm:
	•	textarea (или input) для question.
	•	селект/кнопки для выбора mode (default | short_only | debug).
	•	кнопка «Спросить»:
	•	disabled, если question.trim().length === 0 или isLoading.
	5.	Логика отправки:
	•	по submit:
	•	setIsLoading(true), setError(null);
	•	вызвать askQuestion({ question, mode, max_context_chunks: 5 });
	•	по успеху:
	•	пуш в history (c id = Date.now().toString()).
	•	очистить question.
	•	по ошибке:
	•	setError("Ошибка при обращении к боту…").
	•	finally → setIsLoading(false).

⸻

Этап 4. Компоненты UI

4.1. QuestionForm

Цель: форма ввода вопроса + базовые опции.

Задачи:
	1.	Пропсы:

interface QuestionFormProps {
  value: string;
  mode: AskMode;
  isLoading: boolean;
  onChangeValue: (v: string) => void;
  onChangeMode: (m: AskMode) => void;
  onSubmit: () => void;
}


	2.	Вёрстка:
	•	textarea (автоувеличение по высоте — опционально).
	•	маленький селект/радио для mode.
	•	кнопка «Спросить», показывать спиннер при isLoading.

⸻

4.2. AnswerCard

Цель: красиво отобразить один ответ бота.

Задачи:
	1.	Пропсы:

interface AnswerCardProps {
  question: string;
  response: AskResponse;
}


	2.	Состояние внутри:

const [showFull, setShowFull] = useState(false);
const [showCitations, setShowCitations] = useState(false);
const [showContext, setShowContext] = useState(false); // опционально для debug


	3.	Отображать:
	•	Вопрос (слева/справа, как «юзерский месседж»).
	•	Если response.can_answer === false:
	•	выделенный блок с текстом отказа (answer_short).
	•	Иначе:
	•	блок answer_short (Markdown).
	•	кнопка «Раскрыть полный ответ» → answer_full (Markdown).
	•	кнопка «Показать цитаты» → список citations:
	•	Книга / Глава / Позиция
	•	quote как markdown-цитата:

> "цитата"
> (*The Fellowship of the Ring*, глава N)


	•	если включён mode === "debug":
	•	кнопка «Показать контекст» → список context_chunks и raw_scores:
	•	таблица chunk_id/score, разворачиваемый текст чанка.

⸻

4.3. MarkdownViewer

Цель: нормальный рендер markdown.

Задачи:
	1.	Использовать react-markdown (+ remark-gfm при желании).
	2.	Компонент:

const MarkdownViewer: FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown>{content}</ReactMarkdown>
);



⸻

Этап 5. Страница / админка для переиндексации (опционально)

Цель: дать себе/админу кнопку «перепроиндексировать корпус».

Задачи:
	1.	Страница AdminPage:
	•	инпут для ADMIN_TOKEN (в dev можно сохранить в localStorage).
	•	кнопка «Переиндексировать корпус»:
	•	по нажатию:
	•	setIsReindexing(true);
	•	вызвать reindex({ mode: "full" }, adminToken).
	•	по успеху — показать сообщение: "Проиндексировано N чанков за X секунд".
	•	по ошибке — показать ошибку.
	2.	Добавить на главной небольшой линк/кнопку «Admin» (можно с простым useState и if (isAdminMode)).

⸻

Этап 6. Обработка ошибок и UX

Цель: сделать поведение предсказуемым.

Задачи:
	1.	Глобальный компонент нотификаций или простой error-баннер над формой:
	•	показывает текст из error.
	2.	Обработать кейсы:
	•	400 / 500 на /api/v1/ask → понятное сообщение.
	•	/health не отвечает → индикатор «offline», но не ломать основную работу (юзер может всё равно пробовать спрашивать).
	3.	Автоскролл к последнему ответу:
	•	при добавлении элемента в history — scrollIntoView.

⸻

Этап 7. Минимальная стилизация

Цель: чтобы не было стыдно показать тестовое.

Задачи:
	1.	Ограничить ширину основного контейнера max-width: 800px, центрировать.
	2.	Сделать:
	•	«баббл» для вопросов (например, справа, другой цвет).
	•	«баббл» для ответов (слева).
	3.	Отделить блоки цитат/контекста чуть меньшим шрифтом и другим фоном.

⸻

Этап 8. Локальное тестирование

Цель: убедиться, что фронт корректно общается с беком.

Чек-лист:
	1.	/health корректно отображает online-статус.
	2.	Ввод вопроса:
	•	при can_answer=true → есть краткий ответ и можно раскрыть полный/цитаты.
	•	при can_answer=false → виден отказ, нет лишних кнопок.
	3.	mode=debug:
	•	видно контекстные чанки/оценки.
	4.	/admin/reindex:
	•	с валидным ADMIN_TOKEN возвращает статус и статистику.
	•	при неверном токене — отображается ошибка и понятное сообщение пользователю.

⸻

Если нужно, могу следующим шагом выдать скелет App.tsx + RagBotPage + api/endpoints.ts под этот план (можно просто вставить и завести).