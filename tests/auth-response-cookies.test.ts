import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attachAuthResponseCookies,
  queueAuthResponseCookie,
  runWithAuthResponseCookies,
} from "@/lib/auth-response-cookies";

test("a cookie queued during a NextAuth callback lands on its response", async () => {
  const { result, queuedCookies } = await runWithAuthResponseCookies(async () => {
    queueAuthResponseCookie({
      name: "gb_google_link_challenge",
      value: "one-time-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 600,
      },
    });
    return new Response(null, {
      status: 302,
      headers: {
        location: "https://glampingboat.fr/account/link-google",
        "set-cookie": "next-auth.callback-url=%2Faccount; Path=/; HttpOnly",
      },
    });
  });

  const response = attachAuthResponseCookies(result, queuedCookies);
  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.equal(response.headers.get("location"), "https://glampingboat.fr/account/link-google");
  assert.match(setCookie, /gb_google_link_challenge=one-time-token/);
  assert.match(setCookie, /next-auth\.callback-url/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.doesNotMatch(response.headers.get("location") ?? "", /one-time-token/);
});

test("queueing a response cookie outside the NextAuth route fails loudly", () => {
  assert.throws(
    () =>
      queueAuthResponseCookie({
        name: "cookie",
        value: "value",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          path: "/",
          maxAge: 60,
        },
      }),
    /context is unavailable/
  );
});
