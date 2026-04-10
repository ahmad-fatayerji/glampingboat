export function getErrorMessage(error: unknown, fallback = "Error") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function readJsonResponse<T>(
  response: Response,
  fallback: T
): Promise<T> {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}
