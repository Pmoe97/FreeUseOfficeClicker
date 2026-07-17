# Local mode — run the game without Perchance / internet

This lets you play and test FreeUseOfficeClicker entirely on your own machine, using
**Ollama** for text and **ComfyUI** for images. It does **not** modify `index.html` — the
local dev server injects a tiny shim at request time, so the file stays byte-identical and
plug-and-play on Perchance.

## 🎛️ Easiest way: the Launcher (one double-click)

Double-click **`Launch FreeUseOfficeClicker.bat`** (in the repo root). It starts everything and
opens a **control panel** in your browser where you can:

- ▶ **Open the Game** (one button)
- See live **status** — ComfyUI / Ollama up?, GPU VRAM free, image-queue depth, loaded LLM
- Watch a live **Activity feed** of every AI request — text/image, prompt, status, and how long
  it took. **In-flight requests show a spinner with elapsed time; one stuck past 30s turns red**
  with a "ComfyUI backlog/wedged job" hint. This is how you see *why* generators stall (the same
  trace also prints to the black launcher window: `[ai] ✓ image #03 200 in 6.2s`).
- **Swap the text model** and **image checkpoint** live (no restart) from dropdowns
- **Start / Restart / Stop ComfyUI** and **Clear the image queue**
- **Download new models** (Ollama name or `hf.co/…`) with a progress bar
- **Free VRAM** (unload the LLM)

Keep the little black launcher window open while you play (closing it stops the game server;
ComfyUI keeps running). Your model choices are saved to `local-dev/launcher-config.json`.

> First run: make sure you've pulled at least one text model (`ollama pull dolphin3`) and have
> an image checkpoint in `ComfyUI/models/checkpoints`. The panel can pull more for you.
> If ComfyUI lives somewhere other than `D:\AI\ComfyUI_windows_portable`, set `COMFY_DIR`
> (e.g. edit the `.bat` to `set COMFY_DIR=...` before the `node` line).

The manual `node local-dev/server.mjs` path below still works if you prefer no panel.

## How it works

```
browser  ──(same origin)──>  local-dev/server.mjs  ──>  Ollama  (localhost:11434)  [text]
                                                    └──>  ComfyUI (localhost:8188)  [images]
```

`server.mjs` serves `index.html` with an inline `<script>` (from `perchance-shim.js`)
prepended. That shim defines `window.generateText` / `window.generateImage` — the only two
globals the game expects from Perchance — and routes them to `/ai/text` and `/ai/image` on
the same server, which forward to your local AI. Same-origin means no CORS configuration.

## One-time setup

### 1. Text — Ollama
Ollama is already installed. Two uncensored options (both fit your 11 GB card alongside SD1.5):

```
# Default — L3-8B-Stheno-v3.2: uncensored NSFW-tuned 8B. Best quality-that-fits on 11GB:
# 6.3GB VRAM (same as dolphin3) so SD1.5 stays resident → ~6s images. Explicit + follows
# the game's structured prompts:
ollama pull hf.co/bartowski/L3-8B-Stheno-v3.2-GGUF:Q4_K_M

# Cleaner/less-horny 8B alternative, same footprint:
ollama pull dolphin3

# Optional "prose mode" — 12B, richer writing. BUT it (and Gemma-2-9B, ~9.9GB!) starves the
# image model on 11GB (images thrash to ~170s). Chat-heavy sessions only:
ollama pull hf.co/mradermacher/Mistral-Nemo-Instruct-2407-abliterated-i1-GGUF:Q4_K_M
```

> **Model-size gotcha:** on an 11GB card the text model must stay ≲7GB so SD1.5 keeps its
> VRAM. Param count lies — Gemma-2-**9B** loads at **9.9GB** (huge vocab), *bigger* than a
> Mistral **12B** (9.3GB); both thrash images. Stick to **Llama-3-8B**-based models (~6.3GB).

Make sure the Ollama server is running (the tray app starts it; or run `ollama serve`). The
server defaults to **dolphin3**; switch to the 12B for a session with
`OLLAMA_MODEL=hf.co/mradermacher/Mistral-Nemo-Instruct-2407-abliterated-i1-GGUF:Q4_K_M`.

> **Why not a bigger model by default?** Measured on this 11GB card: an 8B text model + SD1.5
> coexist (images ~6–10s), but a 12B (~8GB VRAM) leaves too little for SD1.5 → every image
> thrashes to ~170s. And **avoid pure RP merges** (NemoMix-Unleashed, Rocinante) entirely —
> great prose, but they emit an instant end-of-turn token on plain instructions, so the
> game's YES/NO classifier and image-prompt refiner return empty. Stick to *instruct* models.

### 2. Images — ComfyUI
ComfyUI is at `D:\AI\ComfyUI_windows_portable`. Start it:

```
D:\AI\ComfyUI_windows_portable\run_nvidia_gpu.bat
```

It exposes its API on `http://127.0.0.1:8188` automatically — you do **not** need to use the
ComfyUI GUI; the server drives it over HTTP.

**VRAM reality (11 GB card):** an 8B LLM (~6.3 GB) and **SDXL** (~9 GB) cannot both stay in
VRAM at once — they evict each other and everything crawls. So the default image model is
**SD1.5 AbsoluteReality** (`absolutereality_v181.safetensors`, ~2 GB, photoreal, NSFW-capable),
which coexists with dolphin3 and renders in **~5–8 s** at 512×768. Your existing
**Juggernaut XL** is still there for occasional top-quality hero shots — see "SDXL mode" below.

## 📱 Connect from your phone

The phone only needs to reach **port 3000** — the server proxies to ComfyUI/Ollama itself.

### At home (same Wi-Fi)
1. **One-time:** open the firewall for port 3000. In an **Administrator** PowerShell:
   ```powershell
   New-NetFirewallRule -DisplayName "FUOC 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private
   ```
2. Start the launcher on the PC, then on your phone (same Wi-Fi) open:
   **`http://192.168.1.179:3000/`** (game) or `…/panel` (controls).
   *(If the PC's Wi-Fi IP changes, re-check with `ipconfig` → IPv4 of the Wi-Fi adapter.)*
3. **NordVPN note:** you run NordVPN. If the phone can't connect, allow local traffic —
   NordVPN → Settings → turn **off "Invisibility on LAN"** (and the kill switch shouldn't
   block LAN). LAN traffic normally bypasses the VPN, so this usually just works.

### Away from home (bonus) — use Tailscale (private + secure)
The control panel can start/stop processes and pull models, and the content is adult — so
**do not expose it to the public internet.** Tailscale makes a private encrypted mesh between
just your devices (and coexists fine with NordVPN — it only routes its own `100.x` range):
1. Install Tailscale on the **PC** and the **phone**, sign in to the same account on both.
2. On the PC, note its Tailscale IP (`tailscale ip -4`, looks like `100.x.y.z`).
3. From the phone **anywhere**, open `http://100.x.y.z:3000/`.

**Tip — unified phone saves:** the game's saves are per-origin in the browser. If you use the
`192.168…` address at home and the `100.x…` address away, your phone keeps *two* separate
save sets. To avoid that, just use the **Tailscale IP everywhere** (it works at home too) —
one address, one save.

> Alternative (quick but public): `cloudflared tunnel --url http://localhost:3000` gives an
> instant public HTTPS URL — but anyone with the link hits your panel. Only use it briefly,
> and prefer Tailscale.

## Run

From the repo root:

```
node local-dev/server.mjs
```

Then open <http://localhost:3000>. (Or use the `office-clicker-local` entry in
`.claude/launch.json`.)

You should see in the browser console: `[LocalAI] Perchance shim active …`. Ask an NPC for a
selfie or send a chat — text comes from Ollama, images from ComfyUI.

## Configuration (env vars)

All optional; sensible defaults are baked in.

| Var | Default | Notes |
|-----|---------|-------|
| `PORT` | `3000` | Server / game port |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | |
| `OLLAMA_MODEL` | `hf.co/bartowski/L3-8B-Stheno-v3.2-GGUF:Q4_K_M` | Any pulled model (8B fits + fast; 9B/12B thrash images) |
| `OLLAMA_NUM_CTX` | `8192` | Context window (the game sends large prompts) |
| `OLLAMA_MAX_TOKENS` | `600` | Default reply length cap (Ollama's own default of 128 is too short) |
| `COMFY_URL` | `http://127.0.0.1:8188` | |
| `CHECKPOINT` | `epiCPhotoGasmVAE.safetensors` | NSFW-willing photoreal; `absolutereality_v181.safetensors` = tamer |
| `IMG_WIDTH` / `IMG_HEIGHT` | `512` / `768` | SD1.5 sizes; SDXL wants `832`×`1216` etc. |
| `IMG_STEPS` | `28` | |
| `IMG_CFG` | `7.0` | SD1.5 likes ~7; SDXL likes ~5 |
| `IMG_SAMPLER` / `IMG_SCHEDULER` | `dpmpp_2m` / `karras` | |
| `IMG_NEGATIVE` | (quality negative) | Override the default negative prompt |

### SDXL mode (occasional high-quality hero shots)

SDXL can't share VRAM with the LLM on an 11 GB card, so unload the LLM first, then run the
server pointed at Juggernaut XL:

```powershell
ollama stop dolphin3
$env:CHECKPOINT="juggernautXL_ragnarokBy.safetensors"; $env:IMG_WIDTH="832"; $env:IMG_HEIGHT="1216"; $env:IMG_CFG="5"; node local-dev/server.mjs
```

Chat will be slow/unavailable while SDXL holds the VRAM. Switch back (stop the server, drop
the env vars, restart) for normal fast SD1.5 + chat play.

## Troubleshooting

- **"Could not reach Ollama"** → start it (`ollama serve` or the tray app).
- **"Model … not pulled"** → `ollama pull dolphin3`.
- **"Could not reach ComfyUI"** → launch `run_nvidia_gpu.bat`.
- **"Checkpoint … not found"** → set `CHECKPOINT` to the exact filename in
  `ComfyUI/models/checkpoints`.
- **Images time out** → first generation loads the model (slow); raise `IMG_TIMEOUT_MS` or
  lower `IMG_STEPS` / resolution.
- The **CEO chatroom** tab uses a Perchance-only comments plugin and is disabled in local
  mode — everything else works.
