# Outside Cue

A new October 7, 2026 project prepared for DEV Hacktoberfest Week 1: Touch Grass.
This is working local software, **not a submitted competition entry**.

Tell it what you want to notice outside. A real open-weight MiniLM sentence
embedding model matches your words against twelve original observation cues.
Choose a setting and 5, 10, or 15 minutes, review three cues, print them or start
a low-distraction timer, and optionally reflect when you return. Seated outdoor
breaks are supported. No routes, location, weather lookup, health assessment,
species identification, account, telemetry, or paid API.

## Run

Node.js 22+ is required. From this directory:

```powershell
npm ci
npm run prepare:model
npm test
npm run test:live
npm start
```

Open http://127.0.0.1:3271 . With the server running, `npm run test:http`
checks real inference and HTTP boundaries. `PORT` can change the server port;
the HTTP test script currently targets default port 3271.

The preparation step downloads about 24 MB once from an ungated, pinned public
Hugging Face checkpoint. It verifies sizes and the ONNX SHA256 against pinned
Hub metadata. Startup and inference forbid remote model loads. Run preparation
before going offline. There is no silent network-inference fallback; missing
weights prevent startup. Wishes are processed by the loopback server, not sent
to a hosted model; preferences and reflections live only in page memory.

## Real Evidence

- `evidence/model-provenance.json`: checkpoint revision and asset hashes.
- `evidence/live-inference.json`: six authored query/cue checks, real CPU
  inference, 6/6 top-one results. This small development test set is not broad
  validation or a field study.
- `evidence/http-tests.json`: actual running-server checks.
- Desktop and 390px-mobile JPEGs: real browser captures; no horizontal overflow
  in tested mobile form/result states.
- `evidence/demo-tour.gif`: four captured desktop states, 20-second loop.
  It is a screenshot tour, not a real-time video or proof of outdoor use.
- `evidence/OutsideCue-demo.mp4`: H.264 version of that capture tour, labelled
  as not real-time. All 480 frames decode; an extracted frame was visually
  checked. No outdoor field trial is claimed.
  [Watch or download the capture tour](https://github.com/m7mdd77/outside-cue/blob/main/evidence/OutsideCue-demo.mp4).

## Architecture And Limits

Transformers.js runs quantized ONNX MiniLM on CPU. Mean-pooled normalized
embeddings are compared by dot product. Only human-authored cues can be returned;
the model cannot generate instructions. Setting filters remove incompatible
park-only/street-only cues. Similarity is not a confidence probability. These
English-oriented embeddings do not establish access, safety, weather, mobility,
or environmental suitability. Users choose a familiar public place and decide
whether conditions are comfortable. No claim of wellbeing efficacy is made.

Loopback-only server, exact static asset allowlist, Host/Origin checks, 4 KB
request ceiling, input validation, one inference request at a time, no request
logging, restrictive CSP, text-only DOM insertion. Do not expose this service
publicly as-is; there is no authentication or internet deployment hardening.

## Attribution

- Model: https://huggingface.co/Xenova/all-MiniLM-L6-v2 , Apache-2.0,
  revision `751bff37182d3f1213fa05d7196b954e230abad9`; an ONNX conversion of
  https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 .
- Runtime: https://github.com/huggingface/transformers.js , pinned npm 3.8.1,
  Apache-2.0; dependency notices remain in installed packages.
- Application code and cue catalog were created independently for this entry
  with Codex assistance. No earlier competition project code was copied.
- Application code and original cue catalog: MIT; see LICENSE.
  No model weights, dependencies, private sessions, logs or account-gate
  screenshots are intended for the public source archive.

## Submission State

Arbitrum Singapore online buildathon ended October 4, so this new project was
prepared for DEV Hacktoberfest Week 1. Source and capture-tour demo are public
at https://github.com/m7mdd77/outside-cue . Contest submission is separate;
this repository does not claim a completed entry or any prize.
