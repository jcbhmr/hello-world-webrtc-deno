import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";
const wss = new Set<WebSocket>()
if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
    new BroadcastChannel("socketmessage").onmessage = (event) => wss.forEach(w => w.send(event.data))
}
Deno.serve(async (request) => {
    if (new URLPattern({ pathname: "/ws" }).test(request.url)) {
        const { socket, response } = Deno.upgradeWebSocket(request)
        socket.onopen = (event) => wss.add(event.target)
        socket.onclose = (event) => wss.delete(event.target)
        socket.onmessage = (event) => {
            const o = new Set(wss)
            o.delete(event.target)
            o.forEach(w => w.send(event.data))
        }
        return response;
    } else {
        return await serveDir(request)
    }
})
