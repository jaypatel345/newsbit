"use client";

import React from "react";

import { MessageSource } from "@/types/message";

// Shared with the brief pages so a chat answer and a story card read as the
// same publication.
const INK = "#1E1E1E";
const BODY_TEXT = "#5B4C3A";
const GOLD = "#8A6A3F";
const MUTED = "#9CA3AF";

// Bold first, so `**x**` is never mistaken for an italic run wrapping `*x*`.
const INLINE_MARKUP = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

/** Render `**bold**`, `*italic*` and `code` spans inside a run of text. */
function renderInline(text: string) {
  return text.split(INLINE_MARKUP).map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold" style={{ color: INK }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="font-mono text-[0.9em]"
          style={{ color: INK }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * A merged story can credit five outlets. Spelling them all out buries the
 * date, so name the first and count the rest.
 */
function splitSources(raw: string): string[] {
  return raw
    .split(/\s*(?:,|&|\band\b)\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

/** The outlet a credit leads with — the one a link should point at. */
function firstSource(raw: string): string {
  return splitSources(raw)[0] ?? "";
}

function compressSources(raw: string): string {
  const names = splitSources(raw);

  if (names.length <= 2) return names.join(" & ");

  return `${names[0]} +${names.length - 1} more`;
}

type Story = {
  title: string;
  body: string;
  sourceName: string;
  /** The first outlet as written, before compression — used to find its URL. */
  sourceLookup: string;
  sourceDate: string;
};

/** Compare outlet names on letters and digits alone. */
function sourceKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Match a written credit to one of the articles the agent actually read.
 * The model writes the outlet's name, never the URL, so a link can only ever
 * point at a real article.
 */
function findSource(
  sources: MessageSource[],
  name: string,
): MessageSource | undefined {
  const key = sourceKey(name);
  if (key.length < 3) return undefined;

  return sources.find((candidate) => {
    const candidateKey = sourceKey(candidate.source || "");
    if (candidateKey.length < 3) return false;

    return (
      candidateKey === key ||
      candidateKey.startsWith(key) ||
      key.startsWith(candidateKey)
    );
  });
}

/**
 * The agent writes each story as `**Headline** – body — Source, date`.
 * Pull those three pieces apart so they can be laid out instead of being
 * dumped into one grey paragraph.
 */
function parseStory(block: string): Story | null {
  const titled = block.match(/^\*\*(.+?)\*\*\s*[–—-]?\s*([\s\S]*)$/);
  if (!titled) return null;

  const title = titled[1].trim();
  let body = titled[2].trim();

  if (!title) return null;

  let sourceName = "";
  let sourceLookup = "";
  let sourceDate = "";

  // The attribution is the trailing em-dash run: "— Reuters, Sep 23, 2026".
  // Anchor on the LAST one so an em dash inside the prose isn't mistaken for
  // it, and keep it only if it's short enough to actually be a credit line.
  // A merged story can credit several outlets, so allow a long-ish run —
  // at 80 those fell through and showed up as raw text in the body.
  const attribution = body.match(/—\s*([^—]{2,160})\s*$/);
  if (attribution) {
    let credit = attribution[1].trim().replace(/[.\s]+$/, "");

    // A trailing "(Sep 16 2026)" is the date, not another outlet.
    const bracketed = credit.match(/\(([^()]+)\)\s*$/);
    if (bracketed) {
      sourceDate = bracketed[1].trim();
      credit = credit.slice(0, bracketed.index).trim().replace(/[,\s]+$/, "");
      sourceName = compressSources(credit);
      sourceLookup = firstSource(credit);
    } else {
      const firstComma = credit.indexOf(",");

      if (firstComma === -1) {
        sourceName = compressSources(credit);
        sourceLookup = firstSource(credit);
      } else {
        const outlets = credit.slice(0, firstComma).trim();
        sourceName = compressSources(outlets);
        sourceLookup = firstSource(outlets);
        sourceDate = credit.slice(firstComma + 1).trim();
      }
    }

    body = body.slice(0, attribution.index).trim().replace(/[–—-]\s*$/, "");
  }

  return { title, body, sourceName, sourceLookup, sourceDate };
}

function SourceChip({
  name,
  date,
  url,
}: {
  name: string;
  date: string;
  url?: string;
}) {
  return (
    <span
      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{ color: "#6B7280" }}
    >
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          // Nothing moves or underlines on hover — the name just goes black.
          className="no-underline transition-colors hover:text-black"
          style={{ color: "inherit" }}
        >
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
      {date && (
        <>
          <span style={{ color: MUTED }}>·</span>
          <span style={{ color: MUTED }}>{date}</span>
        </>
      )}
    </span>
  );
}

function StoryCard({
  story,
  rank,
  sources,
}: {
  story: Story;
  rank: number;
  sources: MessageSource[];
}) {
  const matched = findSource(sources, story.sourceLookup || story.sourceName);

  return (
    <div className="flex gap-3 border-b border-gray-100 py-3 last:border-b-0 sm:gap-4">
      <span
        className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums"
        style={{ color: GOLD }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        <h4
          className="mb-1 text-[15px] font-semibold leading-snug"
          style={{ color: INK }}
        >
          {story.title}
        </h4>

        {story.body && (
          <p className="text-sm leading-relaxed" style={{ color: BODY_TEXT }}>
            {renderInline(story.body)}
          </p>
        )}

        {story.sourceName && (
          <SourceChip
            name={story.sourceName}
            date={story.sourceDate}
            url={matched?.url}
          />
        )}
      </div>
    </div>
  );
}

/** Rows, bullets and loose prose — everything that isn't a story card. */
function LooseLines({ block }: { block: string }) {
  return (
    <>
      {block
        .split("\n")
        .map((line, index) => {
          // Skip blank lines, rules, and table separator rows.
          if (
            line.trim() === "" ||
            /^[-\s]+$/.test(line) ||
            /^—+$/.test(line) ||
            /^\|[-\s]+\|$/.test(line) ||
            (line.includes("|") && line.includes("---"))
          ) {
            return null;
          }

          if (
            line.includes("|") &&
            line.includes("Headline") &&
            line.includes("Why It Matters")
          ) {
            return null;
          }

          // Table rows.
          if (line.includes("|")) {
            const cells = line.split("|").filter((cell) => cell.trim());

            if (cells.length > 1) {
              const isHeaderRow = cells.some((cell) =>
                ["key points", "why it matters"].includes(
                  cell.trim().toLowerCase(),
                ),
              );

              return (
                <div
                  key={index}
                  className={`grid grid-cols-2 gap-3 py-2 ${
                    isHeaderRow
                      ? "border-b-2 border-gray-200"
                      : "border-b border-gray-100"
                  } last:border-0`}
                >
                  {cells.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className={
                        cellIndex === 0
                          ? "text-sm font-semibold"
                          : "text-sm"
                      }
                      style={{
                        color: cellIndex === 0 ? INK : BODY_TEXT,
                      }}
                    >
                      {cell
                        .trim()
                        .split(/<br>/gi)
                        .map((part, partIndex) => (
                          <React.Fragment key={partIndex}>
                            {partIndex > 0 && <br />}
                            {renderInline(part)}
                          </React.Fragment>
                        ))}
                    </div>
                  ))}
                </div>
              );
            }
          }

          // Bullets.
          if (line.trim().startsWith("•") || line.trim().startsWith("- ")) {
            return (
              <div key={index} className="flex items-start gap-2 py-0.5">
                <span
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span
                  className="flex-1 text-sm leading-relaxed"
                  style={{ color: BODY_TEXT }}
                >
                  {renderInline(line.trim().replace(/^[•-]\s*/, "").replace(/<br>/g, " "))}
                </span>
              </div>
            );
          }

          // Section headings.
          const heading = line.match(/^(#{1,6})\s+(.*)$/);
          if (heading) {
            return (
              <h3
                key={index}
                className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wider first:mt-0"
                style={{ color: MUTED }}
              >
                {heading[2]}
              </h3>
            );
          }

          // Plain prose.
          return (
            <p
              key={index}
              className="py-0.5 text-sm leading-relaxed"
              style={{ color: BODY_TEXT }}
            >
              {renderInline(line.replace(/<br>/g, " "))}
            </p>
          );
        })
        .filter(Boolean)}
    </>
  );
}

/**
 * The assistant's text renders from here whether it arrives all at once or a
 * token at a time. Structure the model already emits — headlines, sources,
 * headings — is laid out rather than flattened.
 */
export default function AssistantContent({
  content,
  sources = [],
}: {
  content: string;
  sources?: MessageSource[];
}) {
  const cleaned = content
    .replace(/<function=[^>]+>[\s\S]*?<\/function>/g, "")
    // A story headline doesn't always get a blank line before it — the model
    // often hangs the first one straight off the lead sentence. Promote any
    // headline that starts a line to its own block so it still gets a card.
    .replace(/([^\n])[ \t]*\n(?=\*\*[^*\n]+\*\*)/g, "$1\n\n")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  const blocks = cleaned
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      // A bare `**Heading**` line on its own is a section label, not a
      // story — a story always carries body text or a credit after it.
      const story = parseStory(block);
      const isStory = Boolean(story && (story.body || story.sourceName));

      return { block, story, isStory };
    });

  // Number the story cards in the order they appear.
  const stories = blocks.filter((entry) => entry.isStory);

  return (
    <div className="space-y-2">
      {blocks.map((entry, index) =>
        entry.isStory && entry.story ? (
          <StoryCard
            key={index}
            story={entry.story}
            rank={stories.indexOf(entry) + 1}
            sources={sources}
          />
        ) : (
          <LooseLines key={index} block={entry.block} />
        ),
      )}
    </div>
  );
}
