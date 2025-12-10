import type { AskMode } from "../types";

interface QuestionFormProps {
  value: string;
  mode: AskMode;
  isLoading: boolean;
  onChangeValue: (v: string) => void;
  onChangeMode: (m: AskMode) => void;
  onSubmit: () => void;
}

function QuestionForm({
  value,
  mode,
  isLoading,
  onChangeValue,
  onChangeMode,
  onSubmit
}: QuestionFormProps) {
  return (
    <div className="question-form">
      <textarea
        className="question-form__textarea"
        placeholder="Спросите про 'Властелина колец'..."
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        rows={3}
        disabled={isLoading}
      />

      <div className="question-form__controls">
        <label className="question-form__label">
          Режим:
          <select
            className="question-form__select"
            value={mode}
            onChange={(e) => onChangeMode(e.target.value as AskMode)}
            disabled={isLoading}
          >
            <option value="default">default</option>
            <option value="short_only">short_only</option>
            <option value="debug">debug</option>
          </select>
        </label>

        <button
          className="button"
          type="button"
          onClick={onSubmit}
          disabled={isLoading || value.trim().length === 0}
        >
          {isLoading ? "Отправка..." : "Спросить"}
        </button>
      </div>
    </div>
  );
}

export default QuestionForm;

