"""
Saju Interpreter Module
Analyzes Four Pillars data to produce element stats, class, and interpretations.
"""
import json
import os
from .constants import STEM_ELEMENTS, BRANCH_ELEMENTS


class SajuInterpreter:
    """Interprets pillar data into meaningful stats and personality readings."""

    def __init__(self):
        data_path = os.path.join(os.path.dirname(__file__), '..', 'saju_data.json')
        with open(data_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

    def analyze(self, pillars_data):
        """
        Analyzes pillar meta data to compute element counts,
        dominant element, class, and interpretations.
        """
        meta = pillars_data["meta"]

        # Count elements from all 8 characters (4 stems + 4 branches)
        element_counts = {"Wood": 0, "Fire": 0, "Earth": 0, "Metal": 0, "Water": 0}

        for key in ["year_gan", "month_gan", "day_gan", "hour_gan"]:
            element_counts[STEM_ELEMENTS[meta[key]]] += 1
        for key in ["year_ji", "month_ji", "day_ji", "hour_ji"]:
            element_counts[BRANCH_ELEMENTS[meta[key]]] += 1

        dominant = max(element_counts, key=element_counts.get)
        day_master_element = STEM_ELEMENTS[meta["day_gan"]]

        # Class lookup
        user_class = self.data["classes"].get(dominant, "Wanderer")
        class_description = self.data["class_descriptions"].get(
            dominant, "운명의 흐름을 여행하는 방랑자입니다."
        )

        # Detailed Interpretations
        interpretations = {
            topic: self._get_interpretation(topic, dominant)
            for topic in ["personality", "wealth", "career", "health", "love"]
        }

        # Generate full report text
        detailed_report = f"""
## 1. Essence & Personality
{interpretations['personality']}

## 2. Wealth & Property
{interpretations['wealth']}

## 3. Career & Path
{interpretations['career']}

## 4. Health & Vitality
{interpretations['health']}

## 5. Love & Relationships
{interpretations['love']}
""".strip()

        return {
            "stats": element_counts,
            "class": user_class,
            "class_description": class_description,
            "dominant_element": dominant,
            "day_master": day_master_element,
            "interpretations": interpretations,
            "detailed_report": detailed_report,
            "message": f"You were born with the energy of {day_master_element}, "
                       f"and your chart is most strongly influenced by {dominant}."
        }

    def _get_interpretation(self, topic, dominant):
        """Lookup interpretation text from saju_data.json."""
        return self.data["interpretations"].get(topic, {}).get(
            dominant, "운명의 흐름을 스스로 개척해 나가는 힘이 있습니다."
        )
