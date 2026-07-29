import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";

const hostname = "glampingboat.fr";
const targetHost = "127.0.0.1";
const targetPort = 3100;
const certificatePath = path.resolve(
  process.cwd(),
  ".local-certs",
  "glampingboat.fr.pfx"
);

if (!fs.existsSync(certificatePath)) {
  console.error(
    `Missing ${certificatePath}. Create the local certificate before starting.`
  );
  process.exit(1);
}

const tlsOptions = {
  pfx: fs.readFileSync(certificatePath),
  passphrase:
    process.env.GLAMPINGBOAT_LOCAL_CERT_PASSWORD ??
    "glampingboat-local-development",
};

function proxyRequest(request, response) {
  const upstream = http.request(
    {
      hostname: targetHost,
      port: targetPort,
      method: request.method,
      path: request.url,
      headers: {
        ...request.headers,
        host: hostname,
        "x-forwarded-host": hostname,
        "x-forwarded-proto": "https",
      },
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        upstreamResponse.headers
      );
      upstreamResponse.pipe(response);
    }
  );

  upstream.on("error", (error) => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Local app is unavailable: ${error.message}`);
  });
  request.pipe(upstream);
}

const server = https.createServer(tlsOptions, proxyRequest);

server.on("upgrade", (request, socket, head) => {
  const upstream = http.request({
    hostname: targetHost,
    port: targetPort,
    method: request.method,
    path: request.url,
    headers: {
      ...request.headers,
      host: hostname,
      "x-forwarded-host": hostname,
      "x-forwarded-proto": "https",
    },
  });

  upstream.on("upgrade", (upstreamResponse, upstreamSocket, upstreamHead) => {
    const headers = Object.entries(upstreamResponse.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");
    socket.write(`HTTP/1.1 101 Switching Protocols\r\n${headers}\r\n\r\n`);
    if (upstreamHead.length) socket.write(upstreamHead);
    if (head.length) upstreamSocket.write(head);
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });

  upstream.on("error", () => socket.destroy());
  upstream.end();
});

server.listen(443, "0.0.0.0", () => {
  console.log(`Local HTTPS domain: https://${hostname}`);
  console.log(`Proxy target: http://${targetHost}:${targetPort}`);
});
