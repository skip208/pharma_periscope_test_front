const API_BASE = import.meta.env.VITE_API_BASE_URL;

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE_URL не задан");
  }

  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
    },
    ...rest
  });

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new HttpError(response.status, "HTTP error", data);
  }

  return data as T;
}

