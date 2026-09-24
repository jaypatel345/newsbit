import { Article } from "./article";

export type MessageSource = {
  title: string;
  source: string;
  url: string;
  published?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  /** Articles the agent's tools returned, used to link the source credits. */
  sources?: MessageSource[];
  articles?: Article[];
  created_at?: string;
};
