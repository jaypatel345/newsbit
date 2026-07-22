import { Metadata } from "next";
import NavigationBar from "@/app/components/layout/NavigationBar";
import BriefHeader from "@/app/components/brief-preview/BriefHeader";
import ExecutiveSummaryCard from "@/app/components/brief-preview/ExecutiveSummaryCard";
import StoryCard from "@/app/components/brief-preview/StoryCard";
import KeyTakeaways from "@/app/components/brief-preview/KeyTakeaways";
import AskAICTA from "@/app/components/brief-preview/AskAICTA";

export const metadata: Metadata = {
  title: "Today's Brief | Newsbit AI",
  description:
    "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  openGraph: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
    url: "https://www.newsbit.in/brief",
  },
  twitter: {
    title: "Today's Brief | Newsbit AI",
    description:
      "Understand today's biggest stories in about 2 minutes with AI-powered news summaries.",
  },
};

// Mock data for stories
const mockStories = [
  {
    storyNumber: 1,
    category: "AI",
    headline: "OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities",
    publishedTime: "2 hours ago",
    summary:
      "The latest iteration of OpenAI's language model demonstrates significant improvements in complex reasoning tasks, multi-step problem solving, and mathematical computations. Early benchmarks show a 40% improvement in accuracy on standardized tests.",
    whyItMatters:
      "This advancement could accelerate AI adoption in enterprise settings where complex decision-making is required, potentially transforming industries like healthcare, finance, and scientific research.",
    source: "TechCrunch",
  },
  {
    storyNumber: 2,
    category: "Business",
    headline: "Global Markets Rally as Fed Signals Potential Rate Cuts",
    publishedTime: "3 hours ago",
    summary:
      "Stock markets worldwide surged following Federal Reserve indications that interest rate reductions may be on the horizon. The S&P 500 gained 2.3%, while European and Asian markets also posted strong gains.",
    whyItMatters:
      "Lower interest rates typically boost economic activity by making borrowing cheaper, which could stimulate business investment and consumer spending in the coming months.",
    source: "Bloomberg",
  },
  {
    storyNumber: 3,
    category: "India",
    headline: "India's GDP Growth Exceeds Expectations at 7.2%",
    publishedTime: "4 hours ago",
    summary:
      "Strong performance in manufacturing and services sectors drove economic growth beyond analyst predictions. The government attributed the growth to infrastructure investments and digital economy initiatives.",
    whyItMatters:
      "India's robust economic performance positions it as one of the world's fastest-growing major economies, attracting increased foreign investment and strengthening its global economic influence.",
    source: "Economic Times",
  },
  {
    storyNumber: 4,
    category: "World",
    headline: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
    publishedTime: "5 hours ago",
    summary:
      "World leaders committed to ambitious new targets for reducing carbon emissions by 2030 in a landmark international agreement. The deal includes provisions for financial support to developing nations.",
    whyItMatters:
      "This agreement represents the most significant global climate action since the Paris Agreement, potentially setting the course for international environmental policy for the next decade.",
    source: "Reuters",
  },
  {
    storyNumber: 5,
    category: "Technology",
    headline: "Apple Unveils Revolutionary AR Glasses at Developer Conference",
    publishedTime: "6 hours ago",
    summary:
      "The tech giant introduced augmented reality glasses that promise to seamlessly blend digital content with the real world. The device features advanced spatial computing capabilities and all-day battery life.",
    whyItMatters:
      "This product could mainstream augmented reality technology, creating new opportunities for work, entertainment, and communication while potentially disrupting the smartphone market.",
    source: "The Verge",
  },
  {
    storyNumber: 6,
    category: "Science",
    headline: "Scientists Discover New Method for Carbon Capture Using Algae",
    publishedTime: "7 hours ago",
    summary:
      "Breakthrough research shows promise for scalable carbon dioxide removal using genetically modified algae strains. The method is 50% more efficient than existing carbon capture technologies.",
    whyItMatters:
      "This discovery could provide a cost-effective tool for combating climate change, potentially making carbon capture viable for widespread industrial implementation.",
    source: "Nature",
  },
  {
    storyNumber: 7,
    category: "Sports",
    headline: "Underdog Team Wins Championship in Historic Upset",
    publishedTime: "8 hours ago",
    summary:
      "In a stunning turn of events, the lowest-seeded team defeated the tournament favorites in a dramatic final match. The victory marks the first championship in the team's 75-year history.",
    whyItMatters:
      "The upset has captivated sports fans worldwide, demonstrating the unpredictable nature of competition and inspiring underdog stories across the sporting world.",
    source: "ESPN",
  },
  {
    storyNumber: 8,
    category: "Politics",
    headline: "Major Trade Agreement Signed Between Economic Powers",
    publishedTime: "9 hours ago",
    summary:
      "Two of the world's largest economies signed a comprehensive trade agreement reducing tariffs and establishing new frameworks for digital commerce. The deal is expected to boost bilateral trade by 25%.",
    whyItMatters:
      "This agreement could reshape global trade patterns, potentially reducing economic tensions and creating new opportunities for businesses in both countries.",
    source: "Financial Times",
  },
  {
    storyNumber: 9,
    category: "AI",
    headline: "Google DeepMind Achieves Breakthrough in Protein Folding",
    publishedTime: "10 hours ago",
    summary:
      "Researchers at Google DeepMind have made significant advances in predicting protein structures, which could accelerate drug discovery and our understanding of diseases. The new model achieves 98% accuracy.",
    whyItMatters:
      "This breakthrough could dramatically reduce the time and cost of developing new medicines, potentially leading to treatments for currently incurable diseases.",
    source: "Science Daily",
  },
  {
    storyNumber: 10,
    category: "Business",
    headline: "Electric Vehicle Sales Surge to Record High",
    publishedTime: "11 hours ago",
    summary:
      "Global electric vehicle sales reached an all-time high this quarter, driven by declining battery costs and increased government incentives. Major automakers reported triple-digit growth in EV deliveries.",
    whyItMatters:
      "The rapid adoption of electric vehicles signals a significant shift in the automotive industry toward sustainable transportation, with implications for oil demand and manufacturing.",
    source: "Wall Street Journal",
  },
];

export default function BriefPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          {/* Header */}
          <BriefHeader updatedTime="8:00 AM" storyCount={10} readTime="2 min" />

          {/* Executive Summary */}
          <ExecutiveSummaryCard />

          {/* Story Cards */}
          <div className="mb-12 space-y-6">
            {mockStories.map((story) => (
              <StoryCard
                key={story.storyNumber}
                storyNumber={story.storyNumber}
                category={story.category}
                headline={story.headline}
                publishedTime={story.publishedTime}
                summary={story.summary}
                whyItMatters={story.whyItMatters}
                source={story.source}
              />
            ))}
          </div>

          {/* Key Takeaways */}
          <KeyTakeaways />

          {/* Ask AI CTA */}
          <AskAICTA />
        </div>
      </main>
    </div>
  );
}
