// FreeUseOfficeClicker — Local Launcher / Control Panel
//
// One process that:
//   • serves the game + AI proxies (reused from server.mjs)
//   • serves a browser control panel (panel.html) at /panel
//   • starts/stops/restarts ComfyUI, ensures Ollama is running
//   • lists + live-swaps the text model and image checkpoint (no restart needed)
//   • pulls new Ollama models with progress
//   • opens the panel in your browser on launch
//
// Launch by double-clicking "Launch FreeUseOfficeClicker.bat" (which runs this file).
// Pure Node, no dependencies.

import http from "node:http";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, exec } from "node:child_process";
import {
    CONFIG,
    MIME,
    sendJson,
    readJsonBody,
    handleText,
    handleImage,
    serveGame,
    saveConfig,
    getActivity,
    handleGameReport,
} from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PANEL_FILE = path.resolve(__dirname, "panel.html");
const PORT = CONFIG.PORT;

// --- small helpers ---------------------------------------------------------
async function fetchTO(url, opts = {}, ms = 4000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
        return await fetch(url, { ...opts, signal: ac.signal });
    } finally {
        clearTimeout(t);
    }
}
const okJson = async (url, ms) => {
    try {
        const r = await fetchTO(url, {}, ms);
        return r.ok ? await r.json() : null;
    } catch {
        return null;
    }
};

// --- status ----------------------------------------------------------------
async function getStatus() {
    const stats = await okJson(`${CONFIG.COMFY_URL}/system_stats`, 3000);
    const queue = await okJson(`${CONFIG.COMFY_URL}/queue`, 3000);
    const tags = await okJson(`${CONFIG.OLLAMA_URL}/api/tags`, 3000);
    const ps = await okJson(`${CONFIG.OLLAMA_URL}/api/ps`, 3000);
    const dev = stats?.devices?.[0];
    return {
        config: {
            textModel: CONFIG.OLLAMA_MODEL,
            checkpoint: CONFIG.CHECKPOINT,
            width: CONFIG.IMG_WIDTH,
            height: CONFIG.IMG_HEIGHT,
            steps: CONFIG.IMG_STEPS,
            cfg: CONFIG.IMG_CFG,
        },
        comfy: {
            up: !!stats,
            gpu: dev?.name || null,
            vramFreeGB: dev ? Math.round((dev.vram_free / 1073741824) * 10) / 10 : null,
            queueRunning: queue ? queue.queue_running?.length || 0 : null,
            queuePending: queue ? queue.queue_pending?.length || 0 : null,
        },
        ollama: {
            up: !!tags,
            models: tags ? (tags.models || []).map((m) => m.name) : [],
            loaded: ps ? (ps.models || []).map((m) => `${m.name} (${m.size_vram ? Math.round(m.size_vram / 1073741824) + "GB VRAM" : "?"})`) : [],
        },
        pull: pullState,
    };
}

async function listImageModels() {
    const dir = path.join(CONFIG.COMFY_DIR, "ComfyUI", "models", "checkpoints");
    try {
        const files = await readdir(dir);
        return files.filter((f) => /\.(safetensors|ckpt)$/i.test(f)).sort();
    } catch {
        return [];
    }
}

// --- process management (Windows) ------------------------------------------
async function startComfy() {
    // Guard against a duplicate launch. ComfyUI binds port 8188 AND takes a lock on its sqlite
    // db (user/comfyui.db); a second instance fails with "Port 8188 already in use" + "Could not
    // acquire lock on database … Another ComfyUI process may already be using it" and leaves a
    // dead console behind. If one already answers /system_stats, don't spawn another.
    const alive = await okJson(`${CONFIG.COMFY_URL}/system_stats`, 2500);
    if (alive) return { started: false, alreadyRunning: true, note: "ComfyUI is already running on " + CONFIG.COMFY_URL };
    const bat = CONFIG.COMFY_BAT;
    // Launch in its own minimized console so it survives independently of this launcher.
    const child = spawn("cmd.exe", ["/c", "start", '""', "/min", bat], {
        cwd: CONFIG.COMFY_DIR,
        detached: true,
        stdio: "ignore",
        windowsVerbatimArguments: true,
    });
    child.unref();
    return { started: true, dir: CONFIG.COMFY_DIR, bat };
}
function stopComfy() {
    return new Promise((resolve) => {
        const ps =
            "Get-CimInstance Win32_Process -Filter \"name='python.exe'\" | Where-Object { $_.CommandLine -like '*ComfyUI*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
        exec(`powershell -NoProfile -Command "${ps}"`, () => resolve({ stopped: true }));
    });
}
function ensureOllama() {
    // Harmless if already running (the new 'serve' just exits with 'address in use').
    const child = spawn("cmd.exe", ["/c", "start", '""', "/min", "ollama", "serve"], {
        detached: true,
        stdio: "ignore",
    });
    child.unref();
    return { started: true };
}
function stopOllamaModel(model) {
    return new Promise((resolve) => {
        exec(`ollama stop ${JSON.stringify(model)}`, () => resolve({ stopped: true }));
    });
}
async function clearComfyQueue() {
    try {
        await fetchTO(`${CONFIG.COMFY_URL}/interrupt`, { method: "POST" }, 4000).catch(() => {});
        await fetchTO(`${CONFIG.COMFY_URL}/queue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"clear":true}' }, 4000).catch(() => {});
        return { cleared: true };
    } catch (e) {
        return { cleared: false, error: String(e) };
    }
}

// --- model pulling (with progress) -----------------------------------------
let pullState = { running: false, model: null, line: "", done: false, error: null };
function pullModel(model) {
    if (pullState.running) return { ok: false, error: "A pull is already running." };
    pullState = { running: true, model, line: "starting…", done: false, error: null };
    const child = spawn("ollama", ["pull", model], { stdio: ["ignore", "pipe", "pipe"] });
    const onData = (b) => {
        const s = b.toString().replace(/\r/g, "\n");
        const lines = s.split("\n").map((x) => x.trim()).filter(Boolean);
        if (lines.length) pullState.line = lines[lines.length - 1].slice(0, 200);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData); // ollama prints progress to stderr
    child.on("close", (code) => {
        pullState.running = false;
        pullState.done = true;
        if (code !== 0) pullState.error = `pull exited with code ${code}`;
        else pullState.line = "done";
    });
    child.on("error", (e) => {
        pullState.running = false;
        pullState.done = true;
        pullState.error = String(e);
    });
    return { ok: true };
}

// --- routing ---------------------------------------------------------------
const routes = {
    "GET /api/status": async (req, res) => sendJson(res, 200, await getStatus()),
    "GET /api/activity": async (req, res) => sendJson(res, 200, getActivity()),
    "GET /api/models/image": async (req, res) => sendJson(res, 200, { models: await listImageModels() }),
    "POST /api/config/text": async (req, res) => {
        const { model } = await readJsonBody(req);
        if (!model) return sendJson(res, 400, { error: "model required" });
        CONFIG.OLLAMA_MODEL = model;
        saveConfig();
        sendJson(res, 200, { ok: true, textModel: CONFIG.OLLAMA_MODEL });
    },
    "POST /api/config/image": async (req, res) => {
        const { checkpoint, width, height, steps, cfg } = await readJsonBody(req);
        if (checkpoint) CONFIG.CHECKPOINT = checkpoint;
        if (Number(width)) CONFIG.IMG_WIDTH = Number(width);
        if (Number(height)) CONFIG.IMG_HEIGHT = Number(height);
        if (Number(steps)) CONFIG.IMG_STEPS = Number(steps);
        if (Number(cfg)) CONFIG.IMG_CFG = Number(cfg);
        saveConfig();
        sendJson(res, 200, { ok: true, checkpoint: CONFIG.CHECKPOINT });
    },
    "POST /api/comfy/start": async (req, res) => sendJson(res, 200, await startComfy()),
    "POST /api/comfy/stop": async (req, res) => sendJson(res, 200, await stopComfy()),
    "POST /api/comfy/restart": async (req, res) => {
        await stopComfy();
        // Wait for the port/db lock to release before relaunching, else the new instance hits
        // the same "already in use" error the duplicate-launch guard exists to prevent.
        setTimeout(() => startComfy(), 3500);
        sendJson(res, 200, { restarting: true });
    },
    "POST /api/comfy/clear": async (req, res) => sendJson(res, 200, await clearComfyQueue()),
    "POST /api/ollama/ensure": async (req, res) => sendJson(res, 200, ensureOllama()),
    "POST /api/ollama/stop": async (req, res) => {
        const { model } = await readJsonBody(req);
        sendJson(res, 200, await stopOllamaModel(model || CONFIG.OLLAMA_MODEL));
    },
    "POST /api/pull": async (req, res) => {
        const { model } = await readJsonBody(req);
        if (!model) return sendJson(res, 400, { error: "model required" });
        sendJson(res, 200, pullModel(model));
    },
    "POST /ai/text": handleText,
    "POST /ai/image": handleImage,
    "POST /ai/game-report": handleGameReport,
};

const server = http.createServer(async (req, res) => {
    try {
        const urlPath = req.url.split("?")[0];
        const key = `${req.method} ${urlPath}`;
        if (routes[key]) return await routes[key](req, res);
        if (req.method === "GET" && (urlPath === "/panel" || urlPath === "/panel.html")) {
            const html = await readFile(PANEL_FILE, "utf8");
            res.writeHead(200, { "Content-Type": MIME[".html"] });
            return res.end(html);
        }
        if (req.method === "GET") return await serveGame(req, res, req.url); // game at "/" + assets
        res.writeHead(404);
        res.end("not found");
    } catch (e) {
        console.error("[launcher] error:", e);
        if (!res.headersSent) sendJson(res, 500, { error: String(e) });
        else res.end();
    }
});

server.listen(PORT, "0.0.0.0", () => {
    // 0.0.0.0 = listen on all interfaces so phones/other devices on your network can reach it.
    const panelUrl = `http://localhost:${PORT}/panel`;
    console.log(`\n  🎛️  FreeUseOfficeClicker Launcher`);
    console.log(`  ▶ Control panel: ${panelUrl}`);
    console.log(`  ▶ Game:          http://localhost:${PORT}/`);
    console.log(`\n  Opening the control panel in your browser…\n`);
    // ensure Ollama is up, then open the panel (FUOC_NO_OPEN=1 skips the browser, e.g. for tests)
    ensureOllama();
    if (!process.env.FUOC_NO_OPEN)
        spawn("cmd.exe", ["/c", "start", '""', panelUrl], { detached: true, stdio: "ignore" }).unref();
});
