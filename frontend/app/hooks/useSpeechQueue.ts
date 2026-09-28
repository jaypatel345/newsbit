"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { synthesizeSpeech } from "@/app/services/voice.service";

/** A sentence shorter than this is almost certainly a fragment ("Dr.", "1."),
 *  so hold it back and let the next one complete the thought. */
const MIN_SENTENCE_CHARS = 24;
/** The first clip of a turn is the one the user is waiting on, so it gets a
 *  lower bar — a short opener is worth saying now rather than holding back
 *  for company. */
const MIN_FIRST_SENTENCE_CHARS = 12;
/** Don't wait forever for a full stop: a long clause that keeps streaming
 *  gets spoken at the last comma rather than after the whole paragraph. */
const MAX_PENDING_CHARS = 220;

const SENTENCE_END_RE = /[.!?](?=\s|$)|[:;]\s|\n/g;

/**
 * Short lines spoken while the answer is still being worked out.
 *
 * The agent runs its searches before it writes a word, which measured at
 * six to sixteen seconds — far too long to leave a voice conversation in
 * silence. These are synthesized once when voice mode opens and replayed
 * from memory, so filling the gap costs nothing per turn.
 */
const OPENER_LINES = [
  "One moment.",
  "Let me check.",
  "Sure — looking now.",
  "Give me a second.",
  "Okay, let me look that up.",
];

/** Said only once the wait has gone on a while, so they acknowledge it. */
const WAITING_LINES = [
  "Still looking.",
  "Almost there.",
  "Just pulling the details together.",
];

/** How often the opener is spoken at all. Someone looking something up
 *  doesn't announce it every single time — sometimes they just go quiet for
 *  a moment first, and leaving room for that is what stops the voice sounding
 *  scripted. The later lines aren't optional: by then silence is the odd
 *  thing, not the speech. */
const OPENER_CHANCE = 0.65;

/** Each line's delay is drawn from its window rather than fixed, so the
 *  rhythm differs turn to turn instead of landing like a metronome. */
const OPENER_DELAY_MS = [600, 1500] as const;
const FIRST_WAIT_DELAY_MS = [5200, 6800] as const;
const SECOND_WAIT_DELAY_MS = [10500, 12500] as const;

function randomBetween([min, max]: readonly [number, number]): number {
  return min + Math.random() * (max - min);
}

/** Longest we'll wait for a clip to report itself fully buffered before
 *  playing anyway. Blob URLs are local, so this is a backstop, not a budget. */
const READY_TIMEOUT_MS = 400;

type Clip = { url: string; filler: boolean };

/**
 * Cut `text` at the last point a sentence plausibly ends.
 *
 * Returns the speakable head and the tail still being written. The tail is
 * kept rather than spoken so we never read half a sentence aloud and then
 * pause mid-clause while the next tokens arrive.
 */
function splitSpeakable(
  text: string,
  minChars: number,
): [spoken: string, rest: string] {
  let boundary = -1;
  for (const match of text.matchAll(SENTENCE_END_RE)) {
    const end = match.index + match[0].length;
    if (end >= minChars) boundary = end;
  }

  if (boundary === -1) {
    if (text.length < MAX_PENDING_CHARS) return ["", text];
    // Over budget with no sentence end in sight — break at the last comma,
    // or failing that the last space, so the voice pauses somewhere natural.
    const fallback = Math.max(text.lastIndexOf(", "), text.lastIndexOf(" "));
    if (fallback < minChars) return ["", text];
    boundary = fallback + 1;
  }

  return [text.slice(0, boundary).trim(), text.slice(boundary)];
}

/**
 * Speaks an answer as it streams in, and covers the wait before it starts.
 *
 * `push` is fed the growing answer text; each time a sentence completes it is
 * synthesized and queued. Synthesis and playback are deliberately separate:
 * the next sentence is fetched while the current one is still being spoken,
 * which is what keeps the reply sounding continuous instead of stopping for a
 * round trip between every sentence.
 */
export function useSpeechQueue() {
  const [speaking, setSpeaking] = useState(false);
  /** True while the voice is saying a stall line rather than the answer, so
   *  the panel can still show "thinking" and not claim to be answering. */
  const [fillerPlaying, setFillerPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** Clips fetched and waiting their turn, in order. */
  const queueRef = useRef<Clip[]>([]);
  const playingRef = useRef(false);
  /** Text received so far, so `push` can diff against it. */
  const consumedRef = useRef("");
  /** The tail that has not completed a sentence yet. */
  const pendingRef = useRef("");
  /** Nothing of the real answer has been queued yet this turn. */
  const awaitingFirstRef = useRef(true);
  /** In-flight synthesis, so a stop can abandon it immediately. */
  const abortRef = useRef<AbortController | null>(null);
  /** Chained so sentences are synthesized in the order they were written. */
  const synthChainRef = useRef<Promise<void>>(Promise.resolve());
  /** Bumped on stop: work started before the bump discards its result. */
  const runIdRef = useRef(0);
  const onDoneRef = useRef<(() => void) | null>(null);
  /** Playback advances to the next clip by calling itself, which a
   *  `useCallback` cannot do by name. */
  const playNextRef = useRef<() => void>(() => {});

  /** Cached filler audio, reused for the life of the session. */
  const openerUrlsRef = useRef<string[]>([]);
  const waitingUrlsRef = useRef<string[]>([]);
  const fillerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** The last line actually spoken, so the next pick can avoid it. Hearing
   *  the same words twice running is what makes a stall line sound canned. */
  const lastFillerUrlRef = useRef<string | null>(null);

  const playNext = useCallback(() => {
    const clip = queueRef.current.shift();
    if (!clip) {
      playingRef.current = false;
      setSpeaking(false);
      setFillerPlaying(false);
      // Nothing left to say. If the answer is also finished streaming, the
      // turn is over and the caller can reopen the mic.
      onDoneRef.current?.();
      return;
    }

    playingRef.current = true;
    setSpeaking(true);
    setFillerPlaying(clip.filler);

    const audio = new Audio(clip.url);
    audio.preload = "auto";
    audioRef.current = audio;
    const advance = () => {
      // Filler clips are replayed all session, so only answer audio is freed.
      if (!clip.filler) URL.revokeObjectURL(clip.url);
      if (audioRef.current === audio) audioRef.current = null;
      playNextRef.current();
    };
    audio.onended = advance;
    // A clip that won't decode shouldn't strand the rest of the answer.
    audio.onerror = advance;

    // Playing the instant the element exists starts it mid-decode, which is
    // what clips the first word. Wait until the whole clip can run through
    // without stalling — with a short backstop, since a browser that never
    // fires the event must not swallow the answer.
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      clearTimeout(readyTimer);
      audio.play().catch(advance);
    };
    const readyTimer = setTimeout(begin, READY_TIMEOUT_MS);
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) begin();
    else audio.oncanplaythrough = begin;
    audio.load();
  }, []);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const clearFillerTimers = useCallback(() => {
    fillerTimersRef.current.forEach(clearTimeout);
    fillerTimersRef.current = [];
  }, []);

  /**
   * Fetch the stall lines once, so playing one later costs no round trip.
   *
   * Each clip is stored the moment it arrives rather than after the whole
   * set resolves — a turn that needs a line early can use whichever ones
   * are ready instead of waiting on the slowest.
   */
  const primeFillers = useCallback(async () => {
    if (openerUrlsRef.current.length) return;

    const fetchInto = (target: React.RefObject<string[]>, lines: string[]) =>
      lines.map(async (line) => {
        try {
          const blob = await synthesizeSpeech(line);
          target.current.push(URL.createObjectURL(blob));
        } catch {
          // Without this line the pool is simply smaller; a missing stall
          // line is never worth failing or retrying a turn over.
        }
      });

    await Promise.all([
      ...fetchInto(openerUrlsRef, OPENER_LINES),
      ...fetchInto(waitingUrlsRef, WAITING_LINES),
    ]);
  }, []);

  /** A clip from `pool`, preferring one that isn't what we just said. */
  const pickFiller = useCallback((pool: string[]): string | null => {
    if (!pool.length) return null;
    const fresh = pool.filter((url) => url !== lastFillerUrlRef.current);
    const choices = fresh.length ? fresh : pool;
    return choices[Math.floor(Math.random() * choices.length)];
  }, []);

  /**
   * Start covering the wait for an answer.
   *
   * Each line plays only if the answer still hasn't arrived by its turn, so
   * a fast reply is never spoken over. What gets said, when, and whether the
   * opener is said at all are decided per turn — the same words at the same
   * moment every time is what made this sound like a recording.
   */
  const armFillers = useCallback(() => {
    clearFillerTimers();
    awaitingFirstRef.current = true;

    const schedule: { pool: React.RefObject<string[]>; delay: number }[] = [];
    if (Math.random() < OPENER_CHANCE) {
      schedule.push({
        pool: openerUrlsRef,
        delay: randomBetween(OPENER_DELAY_MS),
      });
    }
    schedule.push({
      pool: waitingUrlsRef,
      delay: randomBetween(FIRST_WAIT_DELAY_MS),
    });
    schedule.push({
      pool: waitingUrlsRef,
      delay: randomBetween(SECOND_WAIT_DELAY_MS),
    });

    for (const { pool, delay } of schedule) {
      const runId = runIdRef.current;
      const timer = setTimeout(() => {
        // Conditions can all change during the wait: the turn may have been
        // stopped, the answer may have started, or an earlier line may still
        // be playing.
        if (runId !== runIdRef.current) return;
        if (!awaitingFirstRef.current) return;
        if (playingRef.current || queueRef.current.length) return;

        // Chosen now rather than when the turn was armed, so it can avoid
        // whatever the previous line turned out to be.
        const url = pickFiller(pool.current);
        if (!url) return;

        lastFillerUrlRef.current = url;
        queueRef.current.push({ url, filler: true });
        playNextRef.current();
      }, delay);
      fillerTimersRef.current.push(timer);
    }
  }, [clearFillerTimers, pickFiller]);

  /** Synthesize one sentence and append it to the playback queue. */
  const enqueue = useCallback((sentence: string) => {
    const runId = runIdRef.current;
    synthChainRef.current = synthChainRef.current.then(async () => {
      if (runId !== runIdRef.current) return;
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const blob = await synthesizeSpeech(sentence, controller.signal);
        if (runId !== runIdRef.current) return;
        queueRef.current.push({
          url: URL.createObjectURL(blob),
          filler: false,
        });
        if (!playingRef.current) playNextRef.current();
      } catch {
        // One unspoken sentence is better than a dead voice session: the
        // text is on screen regardless, so carry on with the next clip.
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    });
  }, []);

  /** Feed the answer text so far; new complete sentences start speaking. */
  const push = useCallback(
    (fullText: string) => {
      // The stream can restart (the backend's "reset"), in which case the new
      // text is not an extension of what we already have.
      if (!fullText.startsWith(consumedRef.current)) {
        consumedRef.current = "";
        pendingRef.current = "";
      }
      const addition = fullText.slice(consumedRef.current.length);
      consumedRef.current = fullText;
      if (!addition) return;

      pendingRef.current += addition;
      const [speakable, rest] = splitSpeakable(
        pendingRef.current,
        awaitingFirstRef.current ? MIN_FIRST_SENTENCE_CHARS : MIN_SENTENCE_CHARS,
      );
      pendingRef.current = rest;
      if (!speakable) return;

      // The answer has begun: no further stall lines.
      awaitingFirstRef.current = false;
      clearFillerTimers();
      enqueue(speakable);
    },
    [enqueue, clearFillerTimers],
  );

  /** The answer is complete: speak whatever sentence was still in progress. */
  const flush = useCallback(
    (onDone?: () => void) => {
      onDoneRef.current = onDone ?? null;
      awaitingFirstRef.current = false;
      clearFillerTimers();

      const tail = pendingRef.current.trim();
      pendingRef.current = "";
      if (tail) {
        enqueue(tail);
        return;
      }
      // Nothing queued and nothing playing means the turn already finished
      // speaking before the stream closed.
      synthChainRef.current = synthChainRef.current.then(() => {
        if (!playingRef.current && queueRef.current.length === 0) {
          onDoneRef.current?.();
        }
      });
    },
    [enqueue, clearFillerTimers],
  );

  /** Cut the voice off now and forget everything queued. */
  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearFillerTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    onDoneRef.current = null;

    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audioRef.current = null;
    }
    queueRef.current.forEach((clip) => {
      if (!clip.filler) URL.revokeObjectURL(clip.url);
    });
    queueRef.current = [];
    playingRef.current = false;
    consumedRef.current = "";
    pendingRef.current = "";
    awaitingFirstRef.current = true;
    setSpeaking(false);
    setFillerPlaying(false);
  }, [clearFillerTimers]);

  useEffect(
    () => () => {
      stop();
      openerUrlsRef.current.forEach(URL.revokeObjectURL);
      waitingUrlsRef.current.forEach(URL.revokeObjectURL);
      openerUrlsRef.current = [];
      waitingUrlsRef.current = [];
    },
    [stop],
  );

  return {
    speaking,
    fillerPlaying,
    push,
    flush,
    stop,
    primeFillers,
    armFillers,
  };
}
