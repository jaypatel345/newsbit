import logging

from app.models.article import Article
from app.models.article_entity import ArticleEntity
from app.models.entity import Entity
from app.prompts.entity_prompt import ENTITY_EXTRACTION_PROMPT
from app.schemas.entity import EntityExtraction
from app.services.core.entities.entity_normalizer import EntityNormalizer
from app.services.infrastructure.ai.llm_service import LLMService
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class EntityService:
    def __init__(self):
        self.llm = LLMService()

    async def extract_entities(self, title: str, content: str) -> EntityExtraction:
        prompt = ENTITY_EXTRACTION_PROMPT.format(
            title=title,
            content=content,
        )

        response = await self.llm.generate(prompt)

        try:
            entities = EntityExtraction.model_validate_json(response)
        except Exception as e:
            logger.error(f"Failed to parse entity extraction JSON: {e}")
            logger.debug(f"Invalid JSON response: {response}")
            # Return empty extraction on failure
            return EntityExtraction()

        return entities

    async def save_entities(
        self,
        db: AsyncSession,
        article_id: int,
        entities: EntityExtraction,
    ) -> None:
        """
        Save entities for an article with normalization and deduplication.

        Args:
            db: Database session
            article_id: Article ID to link entities to
            entities: Extracted entities from LLM
        """
        # Map category names to entity types
        category_to_type: dict[str, str] = {
            "people": "person",
            "companies": "company",
            "organizations": "organization",
            "countries": "country",
            "topics": "topic",
        }

        # Collect all unique (name, type) pairs after normalization
        entity_pairs: set[tuple[str, str]] = set()

        for category, entity_type in category_to_type.items():
            entity_names = getattr(entities, category, [])
            for name in entity_names:
                # Skip generic entities
                if EntityNormalizer.is_generic(name):
                    continue

                # Normalize entity name
                normalized_name = EntityNormalizer.normalize(name, entity_type)
                entity_pairs.add((normalized_name, entity_type))

        if not entity_pairs:
            logger.info(f"No valid entities to save for article {article_id}")
            return

        # Batch lookup existing entities
        existing_entities = await self._lookup_entities(db, entity_pairs)

        # Update normalized_name for existing entities that don't have it
        for entity in existing_entities:
            if not entity.normalized_name:
                entity.normalized_name = EntityNormalizer.compute_normalized_name(
                    entity.name
                )

        existing_map = {(e.name, e.type): e for e in existing_entities}

        # Create new entities that don't exist
        new_entities: list[Entity] = []
        for name, entity_type in entity_pairs:
            if (name, entity_type) not in existing_map:
                normalized_name = EntityNormalizer.compute_normalized_name(name)
                new_entity = Entity(
                    name=name, type=entity_type, normalized_name=normalized_name
                )
                new_entities.append(new_entity)
                existing_map[(name, entity_type)] = new_entity

        # Add new entities to session
        if new_entities:
            db.add_all(new_entities)

        # Flush to get IDs for new entities
        await db.flush()

        # Create article-entity relationships
        # Check for existing relationships to avoid duplicates
        existing_relationships = await self._get_existing_relationships(db, article_id)
        existing_entity_ids = {r.entity_id for r in existing_relationships}

        for name, entity_type in entity_pairs:
            entity = existing_map[(name, entity_type)]
            if entity.id not in existing_entity_ids:
                article_entity = ArticleEntity(
                    article_id=article_id,
                    entity_id=entity.id,
                )
                db.add(article_entity)

        logger.info(f"Saved {len(entity_pairs)} entities for article {article_id}")

    async def _lookup_entities(
        self,
        db: AsyncSession,
        entity_pairs: set[tuple[str, str]],
    ) -> list[Entity]:
        """Lookup entities by (name, type) pairs."""
        if not entity_pairs:
            return []

        # Build conditions for OR query
        conditions = []
        for name, entity_type in entity_pairs:
            conditions.append((Entity.name == name) & (Entity.type == entity_type))

        from sqlalchemy import or_

        result = await db.execute(select(Entity).where(or_(*conditions)))
        return list(result.scalars().all())

    async def _get_existing_relationships(
        self,
        db: AsyncSession,
        article_id: int,
    ) -> list[ArticleEntity]:
        """Get existing article-entity relationships for an article."""
        result = await db.execute(
            select(ArticleEntity).where(ArticleEntity.article_id == article_id)
        )
        return list(result.scalars().all())

    async def get_articles_by_entity(
        self,
        db: AsyncSession,
        entity_id: int,
        limit: int = 20,
    ) -> list[Article]:
        """
        Get all articles associated with a specific entity.

        Args:
            db: Database session
            entity_id: Entity ID to fetch articles for
            limit: Maximum number of articles to return

        Returns:
            List of articles ordered by published_at DESC
        """
        stmt = (
            select(Article)
            .join(ArticleEntity, Article.id == ArticleEntity.article_id)
            .where(ArticleEntity.entity_id == entity_id)
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def search_entities(
        self,
        db: AsyncSession,
        query: str,
        limit: int = 10,
    ) -> list[Entity]:
        """
        Search entities by normalized name with case-insensitive fallback.

        Args:
            db: Database session
            query: User search query
            limit: Maximum number of entities to return

        Returns:
            List of matching entities
        """
        normalized = EntityNormalizer.compute_normalized_name(query)

        # First try exact normalized match
        stmt = select(Entity).where(Entity.normalized_name == normalized).limit(limit)
        result = await db.execute(stmt)
        entities = list(result.scalars().all())

        if entities:
            return entities

        # Fallback to case-insensitive partial match
        stmt = (
            select(Entity)
            .where(func.lower(Entity.name).contains(normalized))
            .order_by(Entity.name)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    def parse_query(self, query: str) -> list[str]:
        """
        Parse a user query into potential entity names.

        Simple implementation: split by spaces and filter common stop words.
        More sophisticated implementations could use NLP.

        Args:
            query: User search query (e.g., "Tesla India AI")

        Returns:
            List of potential entity names
        """
        # Common stop words to filter out
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "from",
            "about",
            "news",
            "latest",
            "recent",
            "new",
            "update",
            "report",
            "story",
            "article",
            "today",
            "yesterday",
        }

        # Split by spaces and filter stop words
        words = query.split()
        return [
            word for word in words if word.lower() not in stop_words and len(word) > 1
        ]

    async def search_articles_by_entities(
        self,
        db: AsyncSession,
        entity_ids: list[int],
        strict_and: bool = False,
        limit: int = 20,
    ) -> list[dict]:
        """
        Search articles by multiple entity IDs with ranking by match count.

        Args:
            db: Database session
            entity_ids: List of entity IDs to search for
            strict_and: If True, require ALL entities to match (HAVING clause)
            limit: Maximum number of articles to return

        Returns:
            List of articles with match_count, ranked by relevance
        """
        if not entity_ids:
            return []

        # Build the query with match counting
        stmt = (
            select(Article, func.count(ArticleEntity.entity_id).label("match_count"))
            .join(ArticleEntity, Article.id == ArticleEntity.article_id)
            .where(ArticleEntity.entity_id.in_(entity_ids))
            .group_by(Article.id)
        )

        # Add HAVING clause for strict AND mode
        if strict_and:
            stmt = stmt.having(
                func.count(func.distinct(ArticleEntity.entity_id)) == len(entity_ids)
            )

        # Order by match count (desc) then by published date (desc)
        stmt = stmt.order_by(desc("match_count"), Article.published_at.desc()).limit(
            limit
        )

        result = await db.execute(stmt)

        # Format results
        articles = []
        for article, match_count in result.all():
            articles.append(
                {
                    "id": article.id,
                    "title": article.title,
                    "summary": article.summary,
                    "url": article.url,
                    "published_at": article.published_at,
                    "source_name": article.source_name,
                    "image_url": article.image_url,
                    "category": article.category,
                    "match_count": match_count,
                }
            )

        return articles
