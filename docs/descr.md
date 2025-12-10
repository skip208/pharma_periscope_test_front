Сделаю такой же «по шагам», но компактно, чисто под базовый фронт.

⸻

0. Предпосылки фронта
	•	Стек (по умолчанию, можно заменить):
	•	React + TypeScript + Vite (или CRA / Next.js — не принципиально).
	•	UI-библиотека по желанию (MUI/Chakra/Tailwind, можно вообще без).
	•	Бэкенд:
	•	POST /api/v1/ask — основной.
	•	GET /health — проверка.
	•	(опционально) POST /admin/reindex — только для админки/отдельной страницы.

⸻

1. Минимальные пользовательские сценарии
	1.	Пользователь вводит вопрос → нажимает «Спросить».
	2.	Видит:
	•	краткий ответ (answer_short, markdown);
	•	кнопки:
	•	«Показать цитаты» (источники);
	•	«Показать полный ответ» (answer_full);
	3.	В случае отказа:
	•	хорошо оформленное сообщение «нет данных в тексте».
	4.	Возможность посмотреть расширенный контекст:
	•	показать citations и/или context_chunks по кнопке.

⸻

2. Архитектура фронта (упрощённая)

Основные сущности:
	•	App — корневой компонент.
	•	ChatPage (или RagBotPage) — основной экран с чатом.
	•	Компоненты:
	•	QuestionForm — инпут + кнопка.
	•	AnswerCard — отображение ответа и источников.
	•	MarkdownViewer — рендер markdown.
	•	(опционально) HealthIndicator — статус бэка.

Состояние:
	•	question — текущий ввод.
	•	isLoading — флаг запроса.
	•	error — текст ошибки (если упало).
	•	history — массив Q/A (для простого чатика).

type QAItem = {
  id: string;
  question: string;
  answer_short: string;
  answer_full: string;
  can_answer: boolean;
  citations: Citation[];
  context_chunks: ContextChunk[];
  createdAt: string;
};



⸻

3. API-слой фронта

Сделать тонкий слой для работы с бэком (например, src/api.ts):
	1.	askQuestion(question: string): Promise<AskResponse>
	•	POST /api/v1/ask
	•	body: { question }
	•	обёртка над fetch/axios, обработка ошибок.
	2.	(опционально) getHealth(): Promise<HealthResponse>
	•	GET /health

Типы подогнать под схемы из бэка:

type AskRequest = {
  question: string;
  mode?: string;
  max_context_chunks?: number;
};

type Citation = {
  book: string;
  book_id: string;
  chapter_title: string;
  chapter_index: number;
  position: number;
  quote: string;
  chunk_id: string;
};

type ContextChunk = {
  chunk_id: string;
  text: string;
  metadata: Record<string, unknown>;
};

type AskResponse = {
  answer_short: string;
  answer_full: string;
  can_answer: boolean;
  citations: Citation[];
  context_chunks: ContextChunk[];
  raw_scores?: { chunk_id: string; score: number }[];
};


⸻

4. UI-поток (основной экран)
	1.	Верх:
	•	Заголовок: «RAG-бот по “Властелину колец”».
	•	Индикатор здоровья бэка (/health), маленькая зелёная/красная точка.
	2.	Центральная часть:
	•	Лента диалога (map по history):
	•	вопрос пользователя (справа/сверху);
	•	блок ответа (AnswerCard) снизу.
	3.	Нижняя панель:
	•	QuestionForm:
	•	<textarea> или <input> для вопроса;
	•	кнопка «Спросить», disabled при isLoading или пустом вопросе.

⸻

5. Компонент AnswerCard

Отвечает за отображение одной пары Q/A:
	1.	Показывает:
	•	краткий ответ (answer_short) — как markdown.
	2.	Кнопки (inline):
	•	«Показать полный ответ» — раскрывает answer_full (markdown) под кратким.
	•	«Показать цитаты» — раскрывает список citations:
	•	Книга, Глава, Позиция;
	•	quote — в виде markdown-цитаты (> "...").
	•	«Показать контекст» (опционально):
	•	раскрывает context_chunks (аккордеон).
	3.	В случае can_answer === false:
	•	оформить ответ карточкой с заметным цветом (например, жёлтая рамка) и текстом отказа.

⸻

6. Рендер Markdown
	1.	Выбрать лёгкую библиотеку, например:
	•	react-markdown (+ remark-gfm при желании).
	2.	Сделать компонент MarkdownViewer:
	•	принимает content: string;
	•	внутри рендерит <ReactMarkdown>{content}</ReactMarkdown>.

⸻

7. Обработка ошибок и состояний
	1.	При отправке вопроса:
	•	isLoading = true;
	•	отключить инпут/кнопку;
	•	показать небольшой спиннер около кнопки / вверху.
	2.	При ошибке сети / 500:
	•	показать toast / баннер: «Ошибка при обращении к серверу. Попробуйте позже.»
	3.	При пустом ответе или неверном формате (fallback от бэка):
	•	просто показать текст, пришедший в answer_short (он уже будет «отказом»).

⸻

8. Базовая верстка и удобства
	•	Сделать дизайн «чатоподобный», но без фанатизма:
	•	Серые «месседж-бабблы», разные цвета для вопроса и ответа.
	•	Зафиксировать ширину контента (например, max-width 800px, центрирование).
	•	Автоскролл при появлении нового ответа к концу страницы.

⸻

9. Опционально (если успеешь)
	•	Переключатель «debug mode»:
	•	Если включён — под ответом показывать raw_scores и metadata чанков.
	•	Маленькая страничка /admin:
	•	Кнопка «Переиндексировать корпус» → POST /admin/reindex с X-Admin-Token (в dev можно хардкодить, в проде — из env).

⸻

Если хочешь, дальше могу выдать сразу минимальный React-код (1–2 файла: App.tsx + api.ts) под этот план, чтобы можно было просто npm install && npm run dev и сразу играться с бэком.