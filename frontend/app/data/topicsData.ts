export interface TopicArticle {
  id: string;
  headline: string;
  source: string;
  sourceWebsite: string;
  time: string;
  image: string;
  author?: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  articles: TopicArticle[];
}

export const topicsData: Topic[] = [
  {
    id: "india",
    name: "India",
    icon: "🇮🇳",
    articles: [
      {
        id: "in-1",
        headline: "OpenAI partners with Indian startups to boost AI adoption",
        source: "Economic Times",
        sourceWebsite: "https://economictimes.indiatimes.com",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=96&h=96&fit=crop",
      },
      {
        id: "in-2",
        headline: "Government announces new AI policy framework",
        source: "Times of India",
        sourceWebsite: "https://timesofindia.indiatimes.com",
        time: "4 hours ago",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=96&h=96&fit=crop",
      },
      {
        id: "in-3",
        headline: "India records strongest GDP growth among G20 nations",
        source: "Business Standard",
        sourceWebsite: "https://www.business-standard.com",
        time: "6 hours ago",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "world",
    name: "World",
    icon: "🌍",
    articles: [
      {
        id: "wd-1",
        headline: "EU reaches agreement on comprehensive AI regulation",
        source: "Reuters",
        sourceWebsite: "https://www.reuters.com",
        time: "1 hour ago",
        image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=96&h=96&fit=crop",
      },
      {
        id: "wd-2",
        headline: "Climate summit concludes with historic carbon deal",
        source: "BBC News",
        sourceWebsite: "https://www.bbc.com/news",
        time: "3 hours ago",
        image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=96&h=96&fit=crop",
      },
      {
        id: "wd-3",
        headline: "Global markets respond to Federal Reserve policy shift",
        source: "Financial Times",
        sourceWebsite: "https://www.ft.com",
        time: "5 hours ago",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "ai",
    name: "AI",
    icon: "🤖",
    articles: [
      {
        id: "ai-1",
        headline: "OpenAI launches new reasoning model with enhanced capabilities",
        source: "The Verge",
        sourceWebsite: "https://www.theverge.com",
        time: "30 min ago",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=96&h=96&fit=crop",
      },
      {
        id: "ai-2",
        headline: "Google DeepMind achieves breakthrough in protein folding",
        source: "Nature",
        sourceWebsite: "https://www.nature.com",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=96&h=96&fit=crop",
      },
      {
        id: "ai-3",
        headline: "Anthropic releases Claude 4 with improved safety features",
        source: "TechCrunch",
        sourceWebsite: "https://techcrunch.com",
        time: "4 hours ago",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    articles: [
      {
        id: "bz-1",
        headline: "Tech stocks surge as AI investments accelerate",
        source: "Bloomberg",
        sourceWebsite: "https://www.bloomberg.com",
        time: "1 hour ago",
        image: "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=96&h=96&fit=crop",
      },
      {
        id: "bz-2",
        headline: "Startup funding reaches new quarterly record",
        source: "Forbes",
        sourceWebsite: "https://www.forbes.com",
        time: "3 hours ago",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=96&h=96&fit=crop",
      },
      {
        id: "bz-3",
        headline: "Major corporations announce sustainability initiatives",
        source: "Wall Street Journal",
        sourceWebsite: "https://www.wsj.com",
        time: "5 hours ago",
        image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    icon: "💻",
    articles: [
      {
        id: "tc-1",
        headline: "Apple unveils revolutionary AR glasses at developer conference",
        source: "The Verge",
        sourceWebsite: "https://www.theverge.com",
        time: "45 min ago",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=96&h=96&fit=crop",
      },
      {
        id: "tc-2",
        headline: "Quantum computing milestone achieved by IBM researchers",
        source: "Wired",
        sourceWebsite: "https://www.wired.com",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=96&h=96&fit=crop",
      },
      {
        id: "tc-3",
        headline: "New cybersecurity threats target AI systems globally",
        source: "Ars Technica",
        sourceWebsite: "https://arstechnica.com",
        time: "4 hours ago",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    articles: [
      {
        id: "sp-1",
        headline: "Champions League final draws record viewership",
        source: "ESPN",
        sourceWebsite: "https://www.espn.com",
        time: "1 hour ago",
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=96&h=96&fit=crop",
      },
      {
        id: "sp-2",
        headline: "Olympic committee announces new AI-powered judging system",
        source: "Sports Illustrated",
        sourceWebsite: "https://www.si.com",
        time: "3 hours ago",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=96&h=96&fit=crop",
      },
      {
        id: "sp-3",
        headline: "Tennis star makes comeback after injury hiatus",
        source: "BBC Sport",
        sourceWebsite: "https://www.bbc.com/sport",
        time: "5 hours ago",
        image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    articles: [
      {
        id: "sc-1",
        headline: "NASA discovers new exoplanet with potential for life",
        source: "Science Daily",
        sourceWebsite: "https://www.sciencedaily.com",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=96&h=96&fit=crop",
      },
      {
        id: "sc-2",
        headline: "Breakthrough in fusion energy announced by MIT",
        source: "Nature",
        sourceWebsite: "https://www.nature.com",
        time: "4 hours ago",
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=96&h=96&fit=crop",
      },
      {
        id: "sc-3",
        headline: "New study reveals impact of microplastics on ocean life",
        source: "National Geographic",
        sourceWebsite: "https://www.nationalgeographic.com",
        time: "6 hours ago",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "health",
    name: "Health",
    icon: "🏥",
    articles: [
      {
        id: "hl-1",
        headline: "FDA approves new Alzheimer's treatment with promising results",
        source: "Medical News Today",
        sourceWebsite: "https://www.medicalnewstoday.com",
        time: "1 hour ago",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=96&h=96&fit=crop",
      },
      {
        id: "hl-2",
        headline: "WHO updates guidelines on mental health in digital age",
        source: "World Health Organization",
        sourceWebsite: "https://www.who.int",
        time: "3 hours ago",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=96&h=96&fit=crop",
      },
      {
        id: "hl-3",
        headline: "Study links sleep patterns to cognitive decline risk",
        source: "Harvard Health",
        sourceWebsite: "https://www.health.harvard.edu",
        time: "5 hours ago",
        image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=96&h=96&fit=crop",
      },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎬",
    articles: [
      {
        id: "et-1",
        headline: "Streaming platforms announce collaborative content deal",
        source: "Variety",
        sourceWebsite: "https://variety.com",
        time: "30 min ago",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=96&h=96&fit=crop",
      },
      {
        id: "et-2",
        headline: "AI-generated film wins award at major festival",
        source: "Hollywood Reporter",
        sourceWebsite: "https://www.hollywoodreporter.com",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=96&h=96&fit=crop",
      },
      {
        id: "et-3",
        headline: "Music industry adapts to AI composition tools",
        source: "Billboard",
        sourceWebsite: "https://www.billboard.com",
        time: "4 hours ago",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=96&h=96&fit=crop",
      },
    ],
  },
];
