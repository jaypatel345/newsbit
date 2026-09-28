"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transcribeAudio } from "@/app/services/voice.service";

export type RecorderState =
  | "idle"
  /** Waiting on getUserMedia — already the user's turn, just not audible yet. */
  | "starting"
  | "listening"
  | "transcribing";

// These numbers decide when someone has finished talking, and they are the
// only dials worth turning if the mic feels impatient or sluggish. They
// err towards waiting: being cut off mid-sentence loses the thought and
// costs a whole retry, while an extra second of patience costs a second.

// What counts as "talking" is measured against the speaker, not against a
// fixed number. Microphone levels differ by an order of magnitude between
// a headset and a laptop across the room, and with any absolute threshold
// one of those two is always wrong: set it high and a quiet voice reads as
// silence between its stressed syllables, which ends the turn mid-sentence;
// set it low and room tone reads as speech, so the turn never ends at all.
// Tracking the room's floor and the speaker's own peak sidesteps the choice.

/** How far above the room's floor, as a fraction of the way to the loudest
 *  recent sound, a reading has to be to count as speech. Deliberately small:
 *  the quiet tail of a word is still the word. */
const SPEECH_FRACTION = 0.12;
/** Floor under the computed threshold, so a silent room can't drive it to
 *  zero and make the mic's own hiss look like talking. */
const ABSOLUTE_SPEECH_FLOOR = 0.008;
/** How fast the noise-floor estimate may climb, per frame — slow, so a
 *  room that gets noisier is tracked without a pause being absorbed. */
const NOISE_FLOOR_DRIFT = 0.00002;
/** How fast the recent-peak estimate fades, per frame. Slow enough to hold
 *  a speaker's level across the pauses inside their sentence. */
const PEAK_DECAY = 0.9995;
/** Genuinely quiet stretch that ends a turn, once we've heard speech at all.
 *  Long enough to sit through the pause people leave while choosing a word.
 *  With the threshold above adapting to the speaker, this now applies to real
 *  silence rather than to the quiet half of somebody's voice — so if a turn
 *  still ends too early, this is the one number to raise. */
const SILENCE_HOLD_MS = 2600;
/** Ignore blips — a cough shouldn't count as a turn worth transcribing. */
const MIN_SPEECH_MS = 350;
/** How long an open mic waits for a first word before giving the turn back.
 *  Covers thinking time before someone starts, not a pause inside a
 *  sentence — that is SILENCE_HOLD_MS. */
const NO_SPEECH_TIMEOUT_MS = 12000;
/** Hard cap so a stuck stream can't record until the tab dies. Also the
 *  backstop for a room noisy enough that the silence rule never fires: what
 *  was said still gets transcribed, it just waits this long first. */
const MAX_RECORDING_MS = 45000;

const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function pickSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return AUDIO_MIME_CANDIDATES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

type UseVoiceRecorderOptions = {
  /** Fires with the transcript once a turn is recorded and transcribed. */
  onTranscript: (text: string) => void;
  /** Fires when the turn produced nothing usable — silence, or a failure. */
  onEmpty?: (reason: "silence" | "error", message?: string) => void;
};

/**
 * Records one spoken turn and transcribes it.
 *
 * The turn ends by itself: we watch the mic's loudness and stop after a
 * short silence, so nobody has to press anything to send what they just
 * said. Loudness is published through a ref rather than state —
 * the waveform reads it sixty times a second, and that must not cost a React
 * render each time.
 */
export function useVoiceRecorder({
  onTranscript,
  onEmpty,
}: UseVoiceRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const [muted, setMuted] = useState(false);
  /** Each turn opens a brand new MediaStream, whose tracks start enabled.
   *  Without this the toggle would keep showing "muted" while a fresh turn
   *  quietly recorded anyway. */
  const mutedRef = useRef(false);

  const levelRef = useRef(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);
  /** The monitor loop re-schedules itself, which a `useCallback` cannot do by
   *  name — it would be referencing itself before it is declared. */
  const monitorRef = useRef<() => void>(() => {});
  const chunksRef = useRef<Blob[]>([]);

  const startedAtRef = useRef(0);
  const speechStartedAtRef = useRef(0);
  const lastLoudAtRef = useRef(0);
  /** Rolling estimates of the room and of this speaker, which together set
   *  the speech threshold for the turn. Reset whenever a turn starts. */
  const noiseFloorRef = useRef(1);
  const peakRef = useRef(0);
  /** Reused across frames: allocating a fresh buffer sixty times a second
   *  is pure garbage for the collector to chase. */
  const samplesRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  /** Set when we stop on purpose, so `onstop` knows whether to transcribe. */
  const outcomeRef = useRef<"transcribe" | "silence" | "discard">("discard");

  // Callbacks live in refs: the monitor loop and the recorder's own `onstop`
  // outlive the render that created them.
  const onTranscriptRef = useRef(onTranscript);
  const onEmptyRef = useRef(onEmpty);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onEmptyRef.current = onEmpty;
  }, [onTranscript, onEmpty]);

  const teardownAudio = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    analyserRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    levelRef.current = 0;
  }, []);

  /** Stop the current turn. `outcome` decides what happens to the audio. */
  const finish = useCallback(
    (outcome: "transcribe" | "silence" | "discard") => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        outcomeRef.current = outcome;
        teardownAudio();
        setState("idle");
        return;
      }
      outcomeRef.current = outcome;
      recorder.stop();
    },
    [teardownAudio],
  );

  const stop = useCallback(() => finish("transcribe"), [finish]);
  const cancel = useCallback(() => finish("discard"), [finish]);

  /** Per-frame loudness read, and the silence rules that end a turn. */
  const monitor = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    if (!samplesRef.current || samplesRef.current.length !== analyser.fftSize) {
      samplesRef.current = new Float32Array(analyser.fftSize);
    }
    const samples = samplesRef.current;
    analyser.getFloatTimeDomainData(samples);

    let sumOfSquares = 0;
    for (const sample of samples) sumOfSquares += sample * sample;
    const rms = Math.sqrt(sumOfSquares / samples.length);

    // The floor only ever sinks to what we actually hear, and creeps back up
    // slowly; the peak jumps to any louder sound and fades. Between them they
    // describe this microphone at this distance in this room.
    noiseFloorRef.current = Math.min(
      rms,
      noiseFloorRef.current + NOISE_FLOOR_DRIFT,
    );
    peakRef.current = Math.max(rms, peakRef.current * PEAK_DECAY);

    const span = peakRef.current - noiseFloorRef.current;
    const threshold = Math.max(
      ABSOLUTE_SPEECH_FLOOR,
      noiseFloorRef.current + span * SPEECH_FRACTION,
    );

    // Show the level against the speaker's own range rather than an assumed
    // one, so the ball reacts the same on a quiet mic as on a loud one — and
    // visibly stops reacting when it genuinely can't hear anything.
    const scaled = Math.min(1, Math.max(0, (rms - noiseFloorRef.current) / Math.max(span, 0.02)));
    levelRef.current += (scaled - levelRef.current) * 0.35;

    const now = performance.now();
    const loud = rms > threshold;
    if (loud) {
      lastLoudAtRef.current = now;
      if (!speechStartedAtRef.current) speechStartedAtRef.current = now;
    }

    const heardSpeech =
      speechStartedAtRef.current > 0 &&
      now - speechStartedAtRef.current > MIN_SPEECH_MS;

    if (heardSpeech && now - lastLoudAtRef.current > SILENCE_HOLD_MS) {
      finish("transcribe");
      return;
    }
    if (!speechStartedAtRef.current && now - startedAtRef.current > NO_SPEECH_TIMEOUT_MS) {
      finish("silence");
      return;
    }
    if (now - startedAtRef.current > MAX_RECORDING_MS) {
      finish(heardSpeech ? "transcribe" : "silence");
      return;
    }

    frameRef.current = requestAnimationFrame(() => monitorRef.current());
  }, [finish]);

  useEffect(() => {
    monitorRef.current = monitor;
  }, [monitor]);

  const start = useCallback(async () => {
    if (recorderRef.current?.state === "recording") return;
    // Say we're on before awaiting the mic: getUserMedia can take a beat, and
    // the panel should read "Listening", not fall back to a thinking state.
    setState("starting");

    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setState("idle");
      onEmptyRef.current?.("error", "This browser can't record audio.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        // Let the browser do the easy cleanup for us; it measurably improves
        // both the transcript and the reliability of silence detection.
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      setState("idle");
      onEmptyRef.current?.(
        "error",
        "Microphone access was blocked. Allow it in your browser to use voice.",
      );
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !mutedRef.current;
    });

    streamRef.current = stream;
    chunksRef.current = [];
    startedAtRef.current = performance.now();
    speechStartedAtRef.current = 0;
    lastLoudAtRef.current = performance.now();
    // Start each turn with no assumptions: the first frames establish the
    // floor, and the first words establish the peak.
    noiseFloorRef.current = 1;
    peakRef.current = 0;
    outcomeRef.current = "discard";

    const mimeType = pickSupportedAudioMimeType();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const outcome = outcomeRef.current;
      const chunks = chunksRef.current;
      chunksRef.current = [];
      recorderRef.current = null;
      teardownAudio();

      if (outcome === "discard") {
        setState("idle");
        return;
      }
      if (outcome === "silence" || chunks.length === 0) {
        setState("idle");
        onEmptyRef.current?.("silence");
        return;
      }

      setState("transcribing");
      try {
        const blob = new Blob(chunks, {
          type: mimeType ?? "audio/webm",
        });
        const transcript = (await transcribeAudio(blob)).trim();
        setState("idle");
        if (transcript) {
          onTranscriptRef.current(transcript);
        } else {
          onEmptyRef.current?.("silence");
        }
      } catch (error) {
        setState("idle");
        onEmptyRef.current?.(
          "error",
          error instanceof Error ? error.message : "Couldn't hear that.",
        );
      }
    };

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    analyserRef.current = analyser;

    recorder.start();
    setState("listening");
    frameRef.current = requestAnimationFrame(() => monitorRef.current());
  }, [teardownAudio]);

  /** Mute keeps the turn open but stops sending the user's audio onward. */
  const toggleMuted = useCallback(() => {
    setMuted((wasMuted) => {
      const nextMuted = !wasMuted;
      mutedRef.current = nextMuted;
      streamRef.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = !nextMuted));
      return nextMuted;
    });
  }, []);

  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") {
        outcomeRef.current = "discard";
        recorderRef.current.stop();
      }
      recorderRef.current = null;
      teardownAudio();
    },
    [teardownAudio],
  );

  return { state, muted, toggleMuted, levelRef, start, stop, cancel };
}
