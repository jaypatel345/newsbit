import re


class EntityNormalizer:
    @staticmethod
    def compute_normalized_name(name: str) -> str:
        """
        Compute normalized name for search indexing.
        
        Args:
            name: The entity name to normalize
            
        Returns:
            Normalized name (lowercase, no punctuation, single spaces)
        """
        text = name.lower().strip()
        text = re.sub(r"[^\w\s]", "", text)
        text = re.sub(r"\s+", " ", text)
        return text

    COUNTRY_ALIASES = {
        "US": "United States",
        "USA": "United States",
        "U.S.": "United States",
        "U.S.A.": "United States",
        "America": "United States",
        "UK": "United Kingdom",
        "U.K.": "United Kingdom",
        "UAE": "United Arab Emirates",
        "EU": "European Union",
    }

    COMPANY_ALIASES = {
        "Facebook": "Meta Platforms",
        "Meta": "Meta Platforms",
        "Google": "Alphabet",
        "Alphabet Inc": "Alphabet",
        "Amazon.com": "Amazon",
        "Amazon.com Inc": "Amazon",
        "Apple Inc": "Apple",
        "Microsoft Corp": "Microsoft",
        "Tesla Inc": "Tesla",
        "NVIDIA Corp": "NVIDIA",
        "Twitter": "X Corp",
        "X": "X Corp",
    }

    ORGANIZATION_ALIASES = {
        "WHO": "World Health Organization",
        "UN": "United Nations",
        "NATO": "North Atlantic Treaty Organization",
        "EU": "European Union",
        "FED": "Federal Reserve",
        "SEC": "Securities and Exchange Commission",
    }

    GENERIC_ENTITIES = {
        "government",
        "people",
        "company",
        "companies",
        "officials",
        "market",
        "markets",
        "industry",
        "industries",
        "today",
        "yesterday",
        "tomorrow",
        "world",
        "global",
        "international",
        "nation",
        "nations",
        "country",
        "countries",
        "state",
        "states",
        "city",
        "cities",
        "public",
        "private",
        "sector",
        "sectors",
        "business",
        "businesses",
        "economy",
        "economic",
        "financial",
        "investors",
        "investment",
        "analysts",
        "experts",
        "authorities",
        "authority",
        "regulators",
        "regulation",
        "policy",
        "policies",
    }

    @classmethod
    def is_generic(cls, name: str) -> bool:
        """Check if entity name is too generic to store."""
        name_lower = name.strip().lower()
        return name_lower in cls.GENERIC_ENTITIES

    @classmethod
    def normalize(cls, name: str, entity_type: str) -> str:
        name = name.strip()

        if entity_type == "country":
            return cls.COUNTRY_ALIASES.get(name, name)

        if entity_type == "company":
            return cls.COMPANY_ALIASES.get(name, name)

        if entity_type == "organization":
            return cls.ORGANIZATION_ALIASES.get(name, name)

        return name
