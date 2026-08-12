export interface SummaryItem {
  text: string;
  article_url: string;
  source_name: string;
}

export interface TodaySummary {
  headline: string;
  theme: string;
  summary: (string | SummaryItem)[];
  key_takeaways: string[];
  categories: string[];
}
