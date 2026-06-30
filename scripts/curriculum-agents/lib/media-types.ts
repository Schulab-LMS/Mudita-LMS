// Shapes for the lesson video pipeline (Task 6). The Video Script agent emits a
// VideoScript; the media-package builder turns it into a human/tool-readable
// video/script.md plus an assets-manifest.json that the media team (or a
// pluggable image/TTS/assembly tool) fulfils. Finished video → Mux via the
// existing video.service flow.

export interface VideoScene {
  /** Spoken narration for this scene. */
  narration: string;
  /** Image / animation generation prompt (Lumo, on-model for the age band + topic). */
  visualPrompt: string;
  /** Optional on-screen caption/text. */
  onScreenText?: string | null;
  durationSec: number;
}

export interface VideoScript {
  lessonTitle: string;
  ageRange: string;
  characterVariant: string;
  /** Tone/style note for the voiceover (e.g. "warm, slow, encouraging"). */
  voiceoverStyle: string;
  thumbnailPrompt: string;
  scenes: VideoScene[];
}

/** One caption cue derived from the scenes, with start/end seconds. */
export interface CaptionCue {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
}

/** The deliverable the media team / asset tools consume to produce the video. */
export interface AssetManifest {
  lessonTitle: string;
  ageRange: string;
  characterVariant: string;
  voiceoverStyle: string;
  totalDurationSec: number;
  thumbnailPrompt: string;
  scenes: {
    index: number;
    durationSec: number;
    imagePrompt: string;
    narration: string;
    onScreenText: string | null;
  }[];
  captions: CaptionCue[];
}

// ── Pluggable asset-generation boundary ─────────────────────────────────────
// Image/TTS/assembly are external tools (provider-agnostic, like the embeddings
// adapter). A concrete provider implements these; the default path emits the
// manifest for a human/media team to fulfil. Wire real providers behind
// env flags (IMAGE_PROVIDER / TTS_PROVIDER / VIDEO_PROVIDER) when chosen.

export interface ImageGenerator {
  /** Generate an image for `prompt`; return the local file path written. */
  generate(prompt: string, outPath: string): Promise<string>;
}

export interface TtsProvider {
  /** Synthesize `text` in `voiceStyle`; return the local audio file path. */
  synthesize(text: string, voiceStyle: string, outPath: string): Promise<string>;
}

export interface VideoAssembler {
  /** Assemble scene images + narration audio into one video file. */
  assemble(opts: {
    images: string[];
    audio: string[];
    durationsSec: number[];
    outPath: string;
  }): Promise<string>;
}
