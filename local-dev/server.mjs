// Local dev server that lets FreeUseOfficeClicker run WITHOUT Perchance/internet.
//
// It does two things:
//   1. Serves the game's index.html but injects a small shim <script> at the very top
//      that defines window.generateText / window.generateImage (the only two globals the
//      game expects Perchance to provide). The file ON DISK is never modified, so it stays
//      byte-identical and plug-and-play on Perchance.
//   2. Exposes same-origin proxy endpoints (/ai/text, /ai/image) that forward to your
//      LOCAL AI: Ollama for text, ComfyUI for images. Same-origin = no CORS headaches.
//
// Run:  node local-dev/server.mjs      (from the repo root; or via the launch.json entry)
// Then open http://localhost:3000
//
// Everything is configurable via env vars (see CONFIG below). No npm dependencies — pure Node.

import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
    PORT: Number(process.env.PORT || 3000),
    GAME_DIR: path.resolve(__dirname, "../FreeUseOfficeClicker"),
    SHIM_FILE: path.resolve(__dirname, "perchance-shim.js"),

    // --- Text (Ollama) ---
    OLLAMA_URL: process.env.OLLAMA_URL || "http://127.0.0.1:11434",
    // Abliterated Mistral-Nemo-Instruct 12B: uncensored, instruction-following, richest prose.
    // User-verified in real play to keep images fast. NOTE: earlier benchmarks showing ~170s
    // images with this model were ComfyUI QUEUE BACKLOG (the game fires a batch of boot
    // portraits that serialize ahead of new requests) — NOT VRAM starvation. Lighter 8B
    // alternatives (same ~6.3GB footprint) remain available in the panel:
    //   • L3-8B-Stheno-v3.2  (NSFW-tuned)   • dolphin3  (cleaner/tamer)
    OLLAMA_MODEL:
        process.env.OLLAMA_MODEL || "hf.co/mradermacher/Mistral-Nemo-Instruct-2407-abliterated-i1-GGUF:Q4_K_M",
    OLLAMA_NUM_CTX: Number(process.env.OLLAMA_NUM_CTX || 8192), // big prompts need headroom
    OLLAMA_DEFAULT_MAX_TOKENS: Number(process.env.OLLAMA_MAX_TOKENS || 600), // Ollama defaults to 128 (too short)
    // Hard ceiling on a single Ollama call. WITHOUT this, a wedged request (model reload, VRAM
    // fight with ComfyUI, runaway generation) hangs forever — and since the game feeds text
    // one-at-a-time, one hang freezes the entire queue (text AND the images built from it). On
    // timeout we fail the request so the game's queue advances instead of stalling permanently.
    OLLAMA_TIMEOUT_MS: Number(process.env.OLLAMA_TIMEOUT_MS || 120000),

    // --- Image (ComfyUI) ---
    // Default = SD1.5 (AbsoluteReality): ~2GB, coexists with dolphin3 in 11GB VRAM, ~5-8s/image.
    // For top-quality hero shots, switch to SDXL with:
    //   CHECKPOINT=juggernautXL_ragnarokBy.safetensors IMG_WIDTH=832 IMG_HEIGHT=1216 IMG_CFG=5
    //   (but unload the LLM first — `ollama stop dolphin3` — or they'll fight over VRAM).
    COMFY_URL: process.env.COMFY_URL || "http://127.0.0.1:8188",
    // ComfyUI install (used by the launcher to start/stop it). run_nvidia_gpu.bat lives here.
    COMFY_DIR: process.env.COMFY_DIR || "D:\\AI\\ComfyUI_windows_portable",
    COMFY_BAT: process.env.COMFY_BAT || "run_nvidia_gpu.bat",
    // epiCPhotoGasm: photoreal SD1.5 that handles explicit/NSFW willingly (AbsoluteReality is
    // coy — tends to "dress" subjects). Both ~2GB and coexist with the 8B LLM. Swap with
    // CHECKPOINT=absolutereality_v181.safetensors for tamer output.
    CHECKPOINT: process.env.CHECKPOINT || "epiCPhotoGasmVAE.safetensors",
    IMG_WIDTH: Number(process.env.IMG_WIDTH || 512),
    IMG_HEIGHT: Number(process.env.IMG_HEIGHT || 768),
    IMG_STEPS: Number(process.env.IMG_STEPS || 28),
    IMG_CFG: Number(process.env.IMG_CFG || 7.0),
    IMG_SAMPLER: process.env.IMG_SAMPLER || "dpmpp_2m",
    IMG_SCHEDULER: process.env.IMG_SCHEDULER || "karras",
    IMG_NEGATIVE:
        process.env.IMG_NEGATIVE ||
        "lowres, worst quality, low quality, bad anatomy, bad hands, extra digits, fewer digits, cropped, jpeg artifacts, signature, watermark, username, text, deformed, mutated, disfigured, extra limbs",
    IMG_TIMEOUT_MS: Number(process.env.IMG_TIMEOUT_MS || 180000),
};

// Saved choices from the control panel (model/checkpoint/dims) override env defaults.
export const CONFIG_FILE = path.resolve(__dirname, "launcher-config.json");
const SAVEABLE = ["OLLAMA_MODEL", "OLLAMA_URL", "CHECKPOINT", "COMFY_URL", "COMFY_DIR", "COMFY_BAT", "IMG_WIDTH", "IMG_HEIGHT", "IMG_STEPS", "IMG_CFG"];
export function loadSavedConfig() {
    try {
        if (existsSync(CONFIG_FILE)) {
            const s = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
            for (const k of SAVEABLE) if (s[k] !== undefined) CONFIG[k] = s[k];
        }
    } catch (e) {
        console.warn("[config] load failed:", e);
    }
}
export function saveConfig() {
    try {
        const out = {};
        for (const k of SAVEABLE) out[k] = CONFIG[k];
        writeFileSync(CONFIG_FILE, JSON.stringify(out, null, 2));
    } catch (e) {
        console.warn("[config] save failed:", e);
    }
}
loadSavedConfig();

export const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (c) => {
            data += c;
            if (data.length > 5e6) reject(new Error("body too large"));
        });
        req.on("end", () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", reject);
    });
}

export function sendJson(res, status, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body);
}
export { readJsonBody };

// ---------------------------------------------------------------------------
// REQUEST TRACING  (observability for stalls)
// ---------------------------------------------------------------------------
// Every /ai/text and /ai/image request is recorded here: a ring buffer of the
// last N finished requests + a live map of in-flight ones. The control panel
// reads this via /api/activity to show a feed; the server terminal logs each
// arrival/finish. This is the missing "why did it stall?" view — a request that
// sits in `inflight` for 40s+ is the smoking gun (usually a ComfyUI backlog).
export const activity = {
    log: [], // finished requests, oldest→newest
    inflight: new Map(), // id -> record (still running)
    MAX: 60,
};
let _reqSeq = 0;
function shortId() {
    return (++_reqSeq).toString(36).padStart(3, "0");
}

// Wrap a raw (req,res) handler so it records timing, final HTTP status, and any
// error body — without the handler needing to know about tracing. Handlers may
// set `req._rec.promptPreview` / `req._rec.note` to enrich the record.
export function trace(kind, handler) {
    return async function (req, res) {
        const rec = {
            id: shortId(),
            kind,
            startedAt: Date.now(),
            finishedAt: null,
            ms: null,
            status: null,
            error: null,
            promptPreview: "",
            note: "",
        };
        req._rec = rec;
        activity.inflight.set(rec.id, rec);
        console.log(`[ai] → ${kind} #${rec.id}`);

        const origWriteHead = res.writeHead.bind(res);
        res.writeHead = (status, ...a) => {
            rec.status = status;
            return origWriteHead(status, ...a);
        };
        const origEnd = res.end.bind(res);
        res.end = (chunk, ...a) => {
            // Auto-capture the error message from JSON error responses.
            if (chunk && rec.status >= 400 && !rec.error) {
                try {
                    rec.error = (JSON.parse(chunk.toString()).error || "").slice(0, 240);
                } catch {}
            }
            return origEnd(chunk, ...a);
        };

        try {
            await handler(req, res);
        } catch (e) {
            if (!rec.error) rec.error = String(e).slice(0, 240);
            if (!rec.status) rec.status = 500;
            throw e;
        } finally {
            rec.finishedAt = Date.now();
            rec.ms = rec.finishedAt - rec.startedAt;
            activity.inflight.delete(rec.id);
            activity.log.push(rec);
            while (activity.log.length > activity.MAX) activity.log.shift();
            const tag = rec.status >= 400 ? "✖" : "✓";
            const secs = (rec.ms / 1000).toFixed(1);
            const tail = rec.error ? ` — ${rec.error}` : rec.note ? ` — ${rec.note}` : "";
            console.log(`[ai] ${tag} ${kind} #${rec.id} ${rec.status} in ${secs}s${tail}`);
        }
    };
}

// Latest game-side queue snapshot, pushed by the shim (POST /ai/game-report). The proxy only
// sees requests the game DISPATCHES; this tells us how many are WAITING in the game's own
// AIRequestQueue/ImageRequestQueue — the number that distinguishes "queue stuck" (queued>0, not
// draining) from "game never enqueued the next one" (queued 0 while mid-cycle).
export let gameReport = { ts: 0, text: null, image: null, logs: [] };
export async function handleGameReport(req, res) {
    const body = await readJsonBody(req).catch(() => ({}));
    gameReport = {
        ts: Date.now(),
        text: body.text || null,
        image: body.image || null,
        logs: Array.isArray(body.logs) ? body.logs.slice(-30) : [],
    };
    sendJson(res, 200, { ok: true });
}

// Snapshot for /api/activity. Includes elapsed time for in-flight requests so a
// stuck one is obvious without waiting for it to finish/time out.
export function getActivity() {
    const now = Date.now();
    return {
        now,
        game: gameReport.ts ? { ...gameReport, age: now - gameReport.ts } : null,
        inflight: [...activity.inflight.values()].map((r) => ({
            id: r.id,
            kind: r.kind,
            elapsedMs: now - r.startedAt,
            promptPreview: r.promptPreview,
            note: r.note,
        })),
        recent: activity.log
            .slice()
            .reverse()
            .map((r) => ({
                id: r.id,
                kind: r.kind,
                ms: r.ms,
                status: r.status,
                error: r.error,
                promptPreview: r.promptPreview,
                note: r.note,
                ago: now - r.finishedAt,
            })),
    };
}

// ---------------------------------------------------------------------------
// TEXT: Ollama  (POST /ai/text  { prompt, options:{temperature,max_tokens,stopSequences} })
// ---------------------------------------------------------------------------
async function coreText(req, res) {
    const { prompt, options = {} } = await readJsonBody(req);
    if (!prompt || !String(prompt).trim()) return sendJson(res, 400, { error: "empty prompt" });
    if (req._rec) req._rec.promptPreview = String(prompt).replace(/\s+/g, " ").slice(0, 90);

    const body = {
        model: CONFIG.OLLAMA_MODEL,
        messages: [{ role: "user", content: String(prompt) }],
        stream: false,
        options: {
            temperature: typeof options.temperature === "number" ? options.temperature : 0.8,
            num_ctx: CONFIG.OLLAMA_NUM_CTX,
            // Floor of 16: some chat templates (e.g. NemoMix) emit leading tokens, so a tiny
            // cap like the YES/NO classifier's max_tokens:3 yields an empty reply. The game
            // parses just the first word anyway, so a small floor is safe.
            num_predict: Math.max(
                16,
                options.max_tokens && options.max_tokens > 0 ? options.max_tokens : CONFIG.OLLAMA_DEFAULT_MAX_TOKENS
            ),
        },
    };
    if (Array.isArray(options.stopSequences) && options.stopSequences.length) body.options.stop = options.stopSequences;

    let r;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), CONFIG.OLLAMA_TIMEOUT_MS);
    try {
        r = await fetch(`${CONFIG.OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: ac.signal,
        });
    } catch (e) {
        if (ac.signal.aborted) {
            return sendJson(res, 504, {
                error: `Ollama did not respond within ${Math.round(CONFIG.OLLAMA_TIMEOUT_MS / 1000)}s — request aborted so the queue can advance. Likely wedged on model load or fighting ComfyUI for VRAM. Try "Free VRAM" or a smaller model.`,
            });
        }
        return sendJson(res, 502, {
            error: `Could not reach Ollama at ${CONFIG.OLLAMA_URL}. Is it running? (run: ollama serve)`,
            detail: String(e),
        });
    } finally {
        clearTimeout(timer);
    }
    if (!r.ok) {
        const txt = await r.text().catch(() => "");
        const hint = /not found|no such model|try pulling/i.test(txt)
            ? `  →  Model "${CONFIG.OLLAMA_MODEL}" not pulled. Run:  ollama pull ${CONFIG.OLLAMA_MODEL}`
            : "";
        return sendJson(res, 502, { error: `Ollama ${r.status}: ${txt.slice(0, 300)}${hint}` });
    }
    const data = await r.json();
    const text = (data?.message?.content || "").trim();
    sendJson(res, 200, { text });
}

// ---------------------------------------------------------------------------
// IMAGE: ComfyUI  (POST /ai/image  { prompt, negativePrompt?, width?, height?, seed? })
// ---------------------------------------------------------------------------
function buildComfyWorkflow({ positive, negative, width, height, seed }) {
    return {
        4: { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: CONFIG.CHECKPOINT } },
        5: { class_type: "EmptyLatentImage", inputs: { width, height, batch_size: 1 } },
        6: { class_type: "CLIPTextEncode", inputs: { text: positive, clip: ["4", 1] } },
        7: { class_type: "CLIPTextEncode", inputs: { text: negative, clip: ["4", 1] } },
        3: {
            class_type: "KSampler",
            inputs: {
                seed,
                steps: CONFIG.IMG_STEPS,
                cfg: CONFIG.IMG_CFG,
                sampler_name: CONFIG.IMG_SAMPLER,
                scheduler: CONFIG.IMG_SCHEDULER,
                denoise: 1,
                model: ["4", 0],
                positive: ["6", 0],
                negative: ["7", 0],
                latent_image: ["5", 0],
            },
        },
        8: { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
        9: { class_type: "SaveImage", inputs: { filename_prefix: "fuoc", images: ["8", 0] } },
    };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function coreImage(req, res) {
    const { prompt, negativePrompt, width, height, seed } = await readJsonBody(req);
    if (!prompt || !String(prompt).trim()) return sendJson(res, 400, { error: "empty prompt" });
    if (req._rec) req._rec.promptPreview = String(prompt).replace(/\s+/g, " ").slice(0, 90);

    const clientId = randomUUID();
    const workflow = buildComfyWorkflow({
        positive: String(prompt),
        negative: negativePrompt || CONFIG.IMG_NEGATIVE,
        width: width || CONFIG.IMG_WIDTH,
        height: height || CONFIG.IMG_HEIGHT,
        seed: Number.isFinite(seed) ? seed : Math.floor(Math.random() * 1e15),
    });

    let promptId;
    try {
        const submit = await fetch(`${CONFIG.COMFY_URL}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: workflow, client_id: clientId }),
        });
        if (!submit.ok) {
            const txt = await submit.text().catch(() => "");
            const hint = /checkpoint|ckpt|not in|value not in list/i.test(txt)
                ? `  →  Checkpoint "${CONFIG.CHECKPOINT}" not found in ComfyUI/models/checkpoints. Set CHECKPOINT env to the exact filename.`
                : "";
            return sendJson(res, 502, { error: `ComfyUI /prompt ${submit.status}: ${txt.slice(0, 400)}${hint}` });
        }
        promptId = (await submit.json())?.prompt_id;
    } catch (e) {
        return sendJson(res, 502, {
            error: `Could not reach ComfyUI at ${CONFIG.COMFY_URL}. Is it running?`,
            detail: String(e),
        });
    }
    if (!promptId) return sendJson(res, 502, { error: "ComfyUI did not return a prompt_id" });
    if (req._rec) req._rec.note = "queued, awaiting ComfyUI…";

    // Poll history until the job produces an image (or time out).
    const deadline = Date.now() + CONFIG.IMG_TIMEOUT_MS;
    let imageInfo = null;
    while (Date.now() < deadline) {
        await sleep(1200);
        let hist;
        try {
            const h = await fetch(`${CONFIG.COMFY_URL}/history/${promptId}`);
            hist = await h.json();
        } catch {
            continue;
        }
        const entry = hist?.[promptId];
        // No history entry yet = still queued or running upstream. Surface the wait
        // so a long stall is visible in the activity feed instead of looking idle.
        if (!entry) {
            if (req._rec) req._rec.note = `waiting on ComfyUI ${Math.round((Date.now() - (deadline - CONFIG.IMG_TIMEOUT_MS)) / 1000)}s`;
            continue;
        }
        if (entry.status?.status_str === "error") {
            return sendJson(res, 502, { error: "ComfyUI reported a workflow error. Check the ComfyUI console." });
        }
        const outputs = entry.outputs || {};
        for (const nodeId of Object.keys(outputs)) {
            const imgs = outputs[nodeId]?.images;
            if (imgs && imgs.length) {
                imageInfo = imgs[0];
                break;
            }
        }
        if (imageInfo) break;
    }
    if (!imageInfo) return sendJson(res, 504, { error: "Timed out waiting for ComfyUI to produce an image." });

    // Fetch the PNG bytes and return as a data: URI (the game accepts data: URLs).
    const params = new URLSearchParams({
        filename: imageInfo.filename,
        subfolder: imageInfo.subfolder || "",
        type: imageInfo.type || "output",
    });
    const view = await fetch(`${CONFIG.COMFY_URL}/view?${params}`);
    if (!view.ok) return sendJson(res, 502, { error: `ComfyUI /view ${view.status}` });
    const buf = Buffer.from(await view.arrayBuffer());
    const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
    if (req._rec) req._rec.note = `${Math.round(buf.length / 1024)} KB image`;
    sendJson(res, 200, { dataUrl });
}

// Exported handlers are the traced wrappers — callers (launcher + standalone)
// get request logging + the /api/activity feed for free.
export const handleText = trace("text", coreText);
export const handleImage = trace("image", coreImage);

// ---------------------------------------------------------------------------
// STATIC + SHIM INJECTION
// ---------------------------------------------------------------------------
export async function serveGame(req, res, urlPath) {
    let rel = decodeURIComponent(urlPath.split("?")[0]);
    if (rel === "/" || rel === "") rel = "/index.html";
    // prevent path traversal
    const filePath = path.normalize(path.join(CONFIG.GAME_DIR, rel));
    if (!filePath.startsWith(CONFIG.GAME_DIR)) {
        res.writeHead(403);
        return res.end("forbidden");
    }
    if (!existsSync(filePath)) {
        res.writeHead(404);
        return res.end("not found");
    }
    const ext = path.extname(filePath).toLowerCase();

    if (rel === "/index.html") {
        const [html, shim] = await Promise.all([readFile(filePath, "utf8"), readFile(CONFIG.SHIM_FILE, "utf8")]);
        // Inject the shim as the FIRST thing in the document so the globals exist before any
        // game script runs. The on-disk file is untouched.
        const injected = `<script>\n/* injected by local-dev/server.mjs — NOT part of index.html */\n${shim}\n</script>\n${html}`;
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        return res.end(injected);
    }

    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
}

// Standalone mode: `node local-dev/server.mjs` runs the bare game+proxy server (no control
// panel). When imported by launcher.mjs this block is skipped, so there's only one listener.
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
    const server = http.createServer(async (req, res) => {
        try {
            if (req.method === "POST" && req.url === "/ai/text") return await handleText(req, res);
            if (req.method === "POST" && req.url === "/ai/image") return await handleImage(req, res);
            if (req.method === "POST" && req.url === "/ai/game-report") return await handleGameReport(req, res);
            if (req.method === "GET" && req.url.split("?")[0] === "/api/activity") return sendJson(res, 200, getActivity());
            if (req.method === "GET") return await serveGame(req, res, req.url);
            res.writeHead(405);
            res.end("method not allowed");
        } catch (e) {
            console.error("[server] error:", e);
            if (!res.headersSent) sendJson(res, 500, { error: String(e) });
            else res.end();
        }
    });
    server.listen(CONFIG.PORT, "0.0.0.0", () => {
        console.log(`\n  FreeUseOfficeClicker — LOCAL mode`);
        console.log(`  ▶ Game:    http://localhost:${CONFIG.PORT}`);
        console.log(`  ▶ Text:    Ollama  ${CONFIG.OLLAMA_URL}  (model: ${CONFIG.OLLAMA_MODEL})`);
        console.log(`  ▶ Images:  ComfyUI ${CONFIG.COMFY_URL}  (checkpoint: ${CONFIG.CHECKPOINT})`);
        console.log(`\n  The on-disk index.html is NOT modified — it stays plug-and-play on Perchance.\n`);
    });
}
