"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSpeechQueue } from "@/app/hooks/useSpeechQueue";
import { useVoiceRecorder } from "@/app/hooks/useVoiceRecorder";

export type VoicePhase =
  /** Answer delivered; the mic stays shut until the user asks for it. */
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking";

type UseVoiceSessionOptions = {
  /** The answer currently streaming in, as the chat page sees it. */
  streamingContent: string;
  /** True from the moment a question is sent until its answer is saved. */
  isAnswering: boolean;
  /** Text of the newest saved assistant message, for the case where the
   *  answer arrived in one piece (HTTP fallback) rather than streamed. */
  latestAnswer: string | null;
  /** Send a question through the normal chat pipeline. */
  onAsk: (text: string) => void;
};

/**
 * Runs a hands-free voice conversation on top of the existing chat.
 *
 * One turn: listen until the user stops talking, transcribe, send the
 * question through the same WebSocket the typed chat uses, speak the answer
 * sentence by sentence as it streams, then reopen the mic. Nothing here
 * knows how answers are produced — that's deliberate, so voice mode gets
 * every tool and source the typed chat already has.
 */
export function useVoiceSession({
  streamingContent,
  isAnswering,
  latestAnswer,
  onAsk,
}: UseVoiceSessionOptions) {
  const [active, setActive] = useState(false);
  /** The turn is over and the mic is closed: nothing is recorded until the
   *  user asks for the next one. Only the first turn of a session opens the
   *  mic on its own — after that, speaking to it is a deliberate act. */
  const [awaitingUser, setAwaitingUser] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** What the user just said, shown while the answer is still coming. */
  const [lastHeard, setLastHeard] = useState<string | null>(null);

  const activeRef = useRef(false);
  /** True once this turn's answer has been handed to the speech queue, so a
   *  late `latestAnswer` doesn't get spoken a second time. */
  const spokeThisTurnRef = useRef(false);
  const wasAnsweringRef = useRef(false);
  /** Set in an effect below. Reopening the mic needs the recorder, and the
   *  recorder's own callbacks need to reopen the mic — this ref is where that
   *  circle is broken. Only ever called asynchronously, well after mount. */
  const startListeningRef = useRef<() => void>(() => {});

  const {
    speaking,
    fillerPlaying,
    push,
    flush,
    stop: stopSpeaking,
    primeFillers,
    armFillers,
  } = useSpeechQueue();

  const endSession = useCallback((message: string) => {
    activeRef.current = false;
    setActive(false);
    setNotice(message);
  }, []);

  const recorder = useVoiceRecorder({
    onTranscript: (text) => {
      if (!activeRef.current) return;
      setNotice(null);
      setLastHeard(text);
      spokeThisTurnRef.current = false;
      armFillers();
      onAsk(text);
    },
    onEmpty: (reason, message) => {
      if (!activeRef.current) return;
      if (reason === "error") {
        endSession(message ?? "Something went wrong with the microphone.");
        return;
      }

      // Heard nothing. Rather than reopen the mic and listen at an empty
      // room, hand it back to the user the same way a finished answer does.
      setNotice("I didn't catch that.");
      setAwaitingUser(true);
    },
  });

  const {
    state: recorderState,
    start: startRecording,
    cancel: cancelRecording,
  } = recorder;

  const startListening = useCallback(() => {
    if (!activeRef.current) return;
    setAwaitingUser(false);
    setNotice(null);
    void startRecording();
  }, [startRecording]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const open = useCallback(() => {
    activeRef.current = true;
    setActive(true);
    setNotice(null);
    setLastHeard(null);
    setAwaitingUser(false);
    // Synthesize the stall lines now, while the user is still drawing
    // breath, so the first one can play the moment it is needed.
    void primeFillers();
    void startRecording();
  }, [startRecording, primeFillers]);

  const close = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    setNotice(null);
    setLastHeard(null);
    setAwaitingUser(false);
    cancelRecording();
    stopSpeaking();
  }, [cancelRecording, stopSpeaking]);

  /** Stop the current answer mid-sentence and take a new question. */
  const interrupt = useCallback(() => {
    stopSpeaking();
    startListening();
  }, [stopSpeaking, startListening]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  // Feed the streaming answer to the speech queue as it grows.
  useEffect(() => {
    if (!active || !streamingContent) return;
    spokeThisTurnRef.current = true;
    push(streamingContent);
  }, [active, streamingContent, push]);

  // The answer finished: speak whatever is left, then take the next turn.
  useEffect(() => {
    const wasAnswering = wasAnsweringRef.current;
    wasAnsweringRef.current = isAnswering;
    if (!active || !wasAnswering || isAnswering) return;

    // No stream arrived — the answer came back whole over the HTTP fallback,
    // so speak that instead of finishing an empty queue.
    if (!spokeThisTurnRef.current && latestAnswer) {
      push(latestAnswer);
    }
    flush(() => {
      if (activeRef.current) setAwaitingUser(true);
    });
  }, [active, isAnswering, latestAnswer, push, flush]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close]);

  // Derived, not stored: every input here is already state somewhere else,
  // and a copy kept in sync by an effect would always be a render behind.
  // A recorder that is idle mid-session means the turn has been handed off —
  // either the answer is being fetched or its first clip is being synthesized.
  const phase: VoicePhase = speaking && !fillerPlaying
    ? "speaking"
    : recorderState === "starting" || recorderState === "listening"
      ? "listening"
      : recorderState === "transcribing"
        ? "transcribing"
        : awaitingUser
          ? "idle"
          : "thinking";

  return {
    active,
    phase,
    notice,
    lastHeard,
    muted: recorder.muted,
    levelRef: recorder.levelRef,
    open,
    close,
    interrupt,
    dismissNotice,
    toggleMuted: recorder.toggleMuted,
  };
}
