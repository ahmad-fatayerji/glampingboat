import { AsyncLocalStorage } from "node:async_hooks";
import { NextResponse } from "next/server";

export type AuthResponseCookie = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
};

const responseCookies = new AsyncLocalStorage<AuthResponseCookie[]>();

export function queueAuthResponseCookie(cookie: AuthResponseCookie) {
  const queue = responseCookies.getStore();
  if (!queue) {
    throw new Error("NextAuth response cookie context is unavailable");
  }
  queue.push(cookie);
}

export async function runWithAuthResponseCookies<T>(action: () => Promise<T>) {
  const queuedCookies: AuthResponseCookie[] = [];
  const result = await responseCookies.run(queuedCookies, action);
  return { result, queuedCookies };
}

export function attachAuthResponseCookies(
  response: Response,
  queuedCookies: AuthResponseCookie[]
) {
  if (queuedCookies.length === 0) return response;

  const outgoing = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  for (const cookie of queuedCookies) {
    outgoing.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return outgoing;
}
