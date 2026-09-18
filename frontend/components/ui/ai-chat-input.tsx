"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { transcribeAudio } from "@/app/services/voice.service";

// ----------------------------------------------------------------------
// Transition Physics
// ----------------------------------------------------------------------
const SPRING_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SMOOTH_HEIGHT_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out";

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------
function ArrowUpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-spin">
      <path d="M7 1a6 6 0 1 0 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const AUDIO_MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function pickSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return AUDIO_MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export interface PromptInputProps {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      onSubmit,
      placeholder = "Ask anything",
      className,
      defaultValue = "",
      value: controlledValue,
      onChange,
    },
    ref
  ) => {
    const [expanded, setExpanded] = useState(false);
    const [isSmoothResize, setIsSmoothResize] = useState(false);
    const [localValue, setLocalValue] = useState(defaultValue);

    // Audio/Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(new Array(5).fill(0));
    const valueRef = useRef(controlledValue !== undefined ? controlledValue : localValue);

    // Refs for Web Audio visualizer & MediaRecorder cleanup
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const [containerHeight, setContainerHeight] = useState(140);
    const [textareaHeight, setTextareaHeight] = useState(80);
    const [isScrolling, setIsScrolling] = useState(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const hasValue = value.trim() !== "";

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const topFadeRef = useRef<HTMLDivElement>(null);
    const bottomFadeRef = useRef<HTMLDivElement>(null);

    // Sync value ref for audio callback closure
    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const updateFades = () => {
      const el = textareaRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (topFadeRef.current) {
        topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
      }
      if (bottomFadeRef.current) {
        const bottomScroll = scrollHeight - clientHeight - scrollTop;
        bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString();
      }
    };

    const handleValueChange = useCallback((val: string) => {
      setIsSmoothResize(true);
      if (!isControlled) setLocalValue(val);
      onChange?.(val);
    }, [isControlled, onChange]);

    const expand = () => {
      setIsSmoothResize(false);
      setExpanded(true);
    };

    // --- Voice Recording Logic ---
    // Releases the mic stream, visualizer, and recorder handle. Does NOT
    // touch isTranscribing - that's owned by whoever is awaiting the API call.
    const releaseMediaResources = useCallback(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    // Stops recording without transcribing - used for unmount/error paths.
    const abortRecording = useCallback(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseMediaResources();
    }, [releaseMediaResources]);

    // Stops recording and sends the captured audio off for transcription.
    const stopRecording = useCallback(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      } else {
        releaseMediaResources();
      }
    }, [releaseMediaResources]);

    const startRecording = useCallback(async () => {
      if (typeof MediaRecorder === "undefined") {
        toast.error("Voice input isn't supported in this browser.");
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        toast.error("Microphone access is required for voice input.");
        return;
      }

      setIsSmoothResize(false);
      setExpanded(true);
      setIsRecording(true);
      streamRef.current = stream;

      // Web Audio API for the live waveform visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        const bands = new Array(5).fill(0);
        const step = Math.floor(dataArray.length / 5);
        for (let i = 0; i < 5; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          bands[i] = sum / step / 255; // normalize to 0-1
        }
        setAudioData(bands);
        rafRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Record the clip, then hand it to the backend for real transcription
      // (Whisper via Groq) once the user stops - the free in-browser
      // SpeechRecognition API depends on reaching Google's servers directly
      // from the client, which is unreliable behind firewalls/VPNs/extensions.
      const mimeType = pickSupportedAudioMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        releaseMediaResources();

        if (chunks.length === 0) return;

        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        setIsTranscribing(true);
        try {
          const text = (await transcribeAudio(blob)).trim();
          if (text) {
            const base = valueRef.current;
            handleValueChange(base ? `${base} ${text}` : text);
          }
        } catch (err) {
          console.error("Transcription failed:", err);
          toast.error("Couldn't transcribe your voice. Please try again.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    }, [handleValueChange, releaseMediaResources]);

    // Keep textarea auto-scrolled to bottom while recording
    useEffect(() => {
      if (isRecording && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, [value, isRecording]);

    // Ensure cleanup of mic/stream on unmount
    useEffect(() => {
      return () => {
        abortRecording();
      };
    }, [abortRecording]);


    useEffect(() => {
      if (value.trim() !== "" && !expanded) {
        setIsSmoothResize(false);
        setExpanded(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, expanded]);

    useEffect(() => {
      if (expanded && !isRecording) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [expanded, isRecording]);

    // ONLY updates height on value/text change.
    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;

      const currentHeight = el.style.height;
      el.style.transition = 'none';
      el.style.height = "0px";
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      void el.offsetHeight;
      el.style.transition = '';

      const newHeight = Math.max(80, Math.min(scrollHeight, 192));
      el.style.height = `${newHeight}px`;

      setTextareaHeight(newHeight);
      setIsScrolling(scrollHeight > 192);

      setTimeout(updateFades, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, expanded]);

    useEffect(() => {
      setContainerHeight(Math.max(140, textareaHeight + 56));
      setTimeout(updateFades, 0);
    }, [textareaHeight]);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget as Node)) return;
      if (value.trim() === "" && !isRecording) {
        setIsSmoothResize(false);
        setExpanded(false);
      }
    };

    const handleSubmit = () => {
      if (value.trim() === "") return;
      setIsSmoothResize(false);
      onSubmit?.(value);
      handleValueChange("");
      setExpanded(false);
    };

    // Calculate action button states
    const showArrow = hasValue && !isRecording && !isTranscribing;
    const showStop = isRecording;
    const showMic = !hasValue && !isRecording && !isTranscribing;
    const showSpinner = isTranscribing;

    const onActionButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isTranscribing) return;
      if (isRecording) {
        stopRecording();
      } else if (hasValue) {
        handleSubmit();
      } else {
        startRecording();
      }
    };

    return (
      // Outer Wrapper for positioning and max-width scaling
      <div
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
            // @ts-ignore
            internalContainerRef.current = node;
          }}
          onBlur={handleBlur}
          className={cn("relative flex flex-col w-full", className)}
          style={{
            maxWidth: expanded ? 640 : 440,
            transition: isSmoothResize ? "max-width 0.15s ease-out" : "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          {/* Main Input Card */}
          <div
            onMouseDown={(e) => {
              const isTextarea = e.target === textareaRef.current;
              if (expanded && !isTextarea && !isRecording) {
                e.preventDefault();
                textareaRef.current?.focus();
              }
            }}
            style={{
              borderRadius: 24,
              height: expanded ? containerHeight : 60,
              transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION,
              overflow: expanded ? "visible" : "hidden",
            }}
            className={cn(
              "relative w-full bg-gray-300/60 backdrop-blur-xl backdrop-saturate-150 border border-gray-300 focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/20 z-10",
              expanded ? "cursor-text" : "cursor-default"
            )}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .prompt-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
              .prompt-scrollbar:hover::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); }
            `}} />

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              onScroll={updateFades}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape" && value.trim() === "") {
                  setIsSmoothResize(false);
                  setExpanded(false);
                }
              }}
              placeholder={placeholder}
              aria-label="Prompt"
              disabled={isRecording}
              style={{
                transition: isSmoothResize
                  ? "height 0.15s ease-out"
                  : "opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
              className={cn(
                "prompt-scrollbar absolute top-0 inset-x-0 z-[1] w-full resize-none bg-transparent pl-5 pr-14 py-4 text-base leading-[24px] text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/80 cursor-text",
                expanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
                isScrolling ? "overflow-y-auto" : "overflow-y-hidden",
                isRecording && "pointer-events-none"
              )}
            />

            <div
              ref={topFadeRef}
              className="absolute left-5 right-14 top-0 z-[2] h-9 bg-gradient-to-b from-white/35 via-white/25 to-transparent pointer-events-none"
            />
            <div
              ref={bottomFadeRef}
              className="absolute left-5 right-14 z-[2] h-9 bg-gradient-to-t from-white/35 via-white/25 to-transparent pointer-events-none"
              style={{
                opacity: 0,
                top: `${textareaHeight - 36}px`,
                transition: isSmoothResize ? "top 0.15s ease-out" : "top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
            />

            <button
              type="button"
              onClick={expand}
              style={{ transition: isSmoothResize ? "none" : "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
              className={cn(
                "absolute inset-x-0 top-0 z-[1] cursor-text pl-5 pr-14 py-[20px] text-left text-base font-medium leading-[20px] text-muted-foreground/80 outline-none",
                !expanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-105 translate-y-1 pointer-events-none"
              )}
              aria-label="Open prompt input"
            >
              {placeholder}
            </button>

            {/* Audio Wave Visualizer Overlay positioned precisely to the left of the mic button */}
            <div
              className={cn(
                "absolute right-14 bottom-2.5 z-[10] flex h-9 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                isRecording ? "w-16 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-4 pointer-events-none"
              )}
            >
              {audioData.map((val, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out"
                  style={{ height: `${Math.max(4, val * 28)}px` }}
                />
              ))}
            </div>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={onActionButtonClick}
              disabled={isTranscribing}
              aria-label={showArrow ? "Send prompt" : showStop ? "Stop recording" : isTranscribing ? "Transcribing voice input" : "Use voice input"}
              style={{ borderRadius: 9999 }}
              className="absolute right-2.5 bottom-2.5 z-[10] flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-default disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="relative flex h-full w-full items-center justify-center">
                <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showArrow ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none")}>
                  <ArrowUpIcon />
                </span>
                <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showMic ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 -rotate-45 blur-[1px] pointer-events-none")}>
                  <MicIcon />
                </span>
                <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showStop ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none")}>
                  <StopIcon />
                </span>
                <span className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]", showSpinner ? "opacity-100 scale-100 rotate-0 blur-none" : "opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none")}>
                  <LoaderIcon />
                </span>
              </span>
            </button>
          </div>
        </div>
    );
  }
);

PromptInput.displayName = "PromptInput";
