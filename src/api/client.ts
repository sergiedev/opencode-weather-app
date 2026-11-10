import { messages } from "../presentation/messages.ts";
import { REQUEST_TIMEOUT_MS } from "../utils/constants.ts";

export type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export async function requestJson(url: URL, fetcher: Fetcher): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new Error(messages.errors.network);
  }

  if (!response.ok) {
    throw new Error(messages.errors.http(response.status));
  }

  try {
    return await response.json();
  } catch {
    throw new Error(messages.errors.response);
  }
}
