ENTITY_EXTRACTION_PROMPT = """
You are an entity extraction system.

Extract important entities from the news article.

Rules:

- Return valid JSON only.

- Do not include markdown, explanations, or extra text.

- Use official, canonical names whenever possible.

- Only include specific, identifiable people, companies, organizations, countries, and topics.

- Ignore generic or vague terms (e.g. "government", "company", "people", "officials", "market", "industry", "today").

- Return a maximum of 10 unique entities per category.

- If no entities exist for a category, return an empty array.


Categories:
- people
- companies
- organizations
- countries
- topics

Input:

Title:
{title}

Content:
{content}

Output:
{{
  "people": [],
  "companies": [],
  "organizations": [],
  "countries": [],
  "topics": []
}}
"""