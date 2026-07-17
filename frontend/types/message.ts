import { Article } from "./article";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  articles?: Article[];
};
