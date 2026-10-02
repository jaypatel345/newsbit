"use client";

import dynamic from "next/dynamic";

export type OrbState = "listening" | "thinking" | "speaking";

// three.js is a few hundred KB, and only voice mode needs it, so the orb is
// loaded when the panel first opens rather than with the chat page.
const Orb = dynamic(() => import("@/components/ui/orb").then((m) => m.Orb), {
  ssr: false,
});

/** Inverted, the shader's white base maps to black, so the ball reads as a
 *  solid black disc and these two grays are the currents moving through it. */
const ORB_COLORS: [string, string] = ["#3A3A3A", "#BDBDBD"];

const ORB_SIZE = 88;

type VoiceOrbProps = {
  state: OrbState;
  /** Live mic loudness, 0..1. Read every frame, so it's a ref by design —
   *  publishing it as state would re-render the page sixty times a second. */
  levelRef: React.RefObject<number>;
};

/**
 * The ball: ElevenLabs' orb (components/ui/orb).
 *
 * While listening it is driven by the user's actual voice through `levelRef`.
 * While thinking or speaking there's no amplitude to read — the answer plays
 * through an `<audio>` element we don't tap — so the orb's own synthesized
 * "thinking" and "talking" motion takes over.
 */
export default function VoiceOrb({ state, levelRef }: VoiceOrbProps) {
  const listening = state === "listening";

  return (
    <div
      role="img"
      aria-label={
        listening ? "Listening" : state === "thinking" ? "Thinking" : "Speaking"
      }
      className="relative"
      style={{ width: ORB_SIZE, height: ORB_SIZE }}
    >
      {/* A plain black disc the size of the rendered ball (it fills ~91% of
          the canvas), so there's a ball on screen while three.js loads and
          the orb fades in over it rather than out of nothing. */}
      <span className="absolute inset-[4.5%] rounded-full bg-black" />
      <Orb
        className="absolute inset-0"
        colors={ORB_COLORS}
        inverted
        agentState={listening ? "listening" : state === "thinking" ? "thinking" : "talking"}
        volumeMode={listening ? "manual" : "auto"}
        inputVolumeRef={levelRef}
        manualOutput={0.45}
      />
    </div>
  );
}
