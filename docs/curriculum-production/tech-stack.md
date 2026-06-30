# Recommended AI Technology Stack

**Principle:** all curriculum generation is RAG/source-grounded — the LLM answers from approved sources only, never from parametric memory.

| Capability | Recommendation | Notes |
|---|---|---|
| LLM (drafting, mapping, scripts) | **Claude Opus 4.8** via Anthropic SDK | Long context, strong reasoning; structured tool-use for schema-valid output. |
| Lighter classification / URL & similarity checks | **Claude Sonnet 4.6** | High-volume passes. **Only Opus 4.8 and Sonnet 4.6 are used — no other models.** |
| Web retrieval / source collection | Server-side fetcher honoring robots/ToS + allowlist of approved domains | Only approved `ReferenceSource` domains. |
| Vector DB | **pgvector** on the existing Postgres | Avoids a new datastore; co-located with content. |
| Embeddings | Hosted embedding model (provider-agnostic adapter) | Store vectors in pgvector with source metadata. |
| RAG pipeline | Custom service in `src/services/` | Retrieval gating + citation enforcement. |
| Image generation | Pluggable (hosted diffusion) driven by Lumo prompt templates | Style anchors keep on-model. |
| Video generation | Pluggable short-video tool consuming `script.md` | Media-team-driven; output → Mux. |
| TTS voiceover | Multilingual TTS (en/ar/de) | Voice style per age band. |
| Captions | TTS-aligned or ASR captioner | Already supported by `VideoAsset.hasCaptions`/`languages`. |
| LMS publishing | **Existing [`curriculum-sync.service.ts`](../../src/services/curriculum-sync.service.ts)** | No new publisher needed. |
| QA / review dashboard | Extend the admin dashboard | Surfaces AI provenance + checklist. |

The Anthropic client is a lazy-initialized singleton in `src/lib/ai.ts`, mirroring the `stripe.ts` / `mux.ts` pattern so the rest of the app boots fine without AI env vars.
