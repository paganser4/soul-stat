import sys
import json
import os
import ephem
from datetime import datetime, timedelta
import google.generativeai as genai

# Configure GenAI
# Note: In production, use os.environ["GOOGLE_API_KEY"]
if "GOOGLE_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

MYUNGSEON_PERSONA = """
You are 'Myungseon' (명선), a legendary Saju master and Daoist sage.
Your tone is mystical, authoritative, yet deeply empathetic and nurturing.
You see the flow of Qi (Energy) in all things.
Your goal is to provide a profound, life-changing analysis of the user's destiny.
You MUST write in English.
Your output must be formatted in clean Markdown.
Structure your response as a "Book of Destiny" with the following chapters:
1. **The Essence of the Soul**: A poetic and deep analysis of their Day Master and elemental balance.
2. **Hidden Strengths & Shadows**: What lies beneath the surface.
3. **The Path of Wealth & Career**: A strategic guide to their professional destiny (simulate a 10-year Daewoon flow).
4. **Heart & Harmony**: Love, relationships, and compatible souls.
5. **Vessel of the Spirit**: Health and wellness advice based on elemental deficiencies/excesses.
6. **The Current Tides**: A forecast for the current year.
7. **Sage's Final Wisdom**: Actionable, philosophical advice to alter their fate (Kaewoon-bup).

Total length should be substantial (aim for depth and detail, approx 10,000 characters if possible, or at least very comprehensive).
"""

# 천간 (Heavenly Stems)
# 천간 (Heavenly Stems)
HEAVENLY_STEMS = ["Yang Wood (甲)", "Yin Wood (乙)", "Yang Fire (丙)", "Yin Fire (丁)", "Yang Earth (戊)", "Yin Earth (己)", "Yang Metal (庚)", "Yin Metal (辛)", "Yang Water (壬)", "Yin Water (癸)"]
# 지지 (Earthly Branches)
EARTHLY_BRANCHES = ["Rat (子)", "Ox (丑)", "Tiger (寅)", "Rabbit (卯)", "Dragon (辰)", "Snake (巳)", "Horse (午)", "Sheep (未)", "Monkey (申)", "Rooster (酉)", "Dog (戌)", "Pig (亥)"]

# 오행 매핑 (Five Elements)
STEM_ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"]
BRANCH_ELEMENTS = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"]

# 십신 매핑 (Ten Gods) - 일간 기준
TEN_GODS_MAP = {
    ("Wood", "Wood"): "BeeGyun", ("Wood", "Fire"): "SikSin", ("Wood", "Earth"): "PyunJae", ("Wood", "Metal"): "PyunGwan", ("Wood", "Water"): "PyunIn",
    # ... Simplified mapping logic needed or full matrix
}

def get_element(stem_idx, is_stem=True):
    if is_stem:
        return STEM_ELEMENTS[stem_idx]
    else:
        return BRANCH_ELEMENTS[stem_idx]

class SajuEngine:
    def __init__(self):
        # Load external data
        data_path = os.path.join(os.path.dirname(__file__), 'saju_data.json')
        with open(data_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

    def compute_saju(self, year, month, day, hour, minute=0):
        """
        Compute the Four Pillars based on exact Solar Terms.
        """
        birth_date = datetime(year, month, day, hour, minute)
        
        # 1. Day Pillar
        # Base date: 1900-01-01 (Gap-Sul day? Need to verify)
        # 1900-01-01 is roughly Lunar 1899-12-01.
        # Standard: 1899-12-23 (Jan 30 1900 is Lunar New Year?)
        # Let's use a known anchor. 2024-01-01 is Gab-Ja (No wait, 2024 is Gab-Jin year).
        # 2024-01-01 is Gap-Ja day? No.
        # Anchor: 1900-01-01 is Monday.
        # Reference: 1924-01-01 (Gap-Ja day start cycle? No).
        
        # Reliable Anchor: 2000-01-01 is Mu-O (戊午) day?
        # Let's use python's ordinal date.
        # Python date(1,1,1).toordinal() -> 1
        # We need a known Gap-Ja day.
        # 2023-01-01 -> Gye-Sa day.
        # Let's use a standard library approach equivalent logic:
        # Day Gan = (Total Days - Offset) % 10
        # Day Ji = (Total Days - Offset) % 12
        
        base_date = datetime(1900, 1, 1)
        # 1900-01-01 is Gap-Sul (甲戌) day. (Valid Reference)
        days_diff = (datetime(year, month, day) - base_date).days
        
        day_gan_idx = (0 + days_diff) % 10  # Gap is 0
        day_ji_idx = (10 + days_diff) % 12 # Sul is 10
        
        day_pillar = {
            "stem": HEAVENLY_STEMS[day_gan_idx],
            "branch": EARTHLY_BRANCHES[day_ji_idx]
        }
        
        # 2. Year Pillar & Month Pillar (Requires Solar Terms)
        # We need to find the solar term dates for the birth year.
        # Ipchun (315 deg) determines the Year start.
        
        # MVP Simplification for Year/Month:
        # Ipchun ~ Feb 4. 
        # Real Saju requires minute-level precision for month change (Jeolgi),
        # but for an MVP, day-level check is acceptable (Jeolgi typically changes on 4-8th of month).
        
        # Solar Terms (approximate dates):
        # Feb 4 (Ipchun) -> Month 1 (In)
        # ...
        
        # Logic:
        # 1. Determine Saju Year.
        # If today < Ipchun(Year), Saju Year = Year - 1
        # Else Saju Year = Year
        
        current_year_ipchun = datetime(year, 2, 4, 0, 0) # Approx
        
        saju_year = year
        if birth_date < current_year_ipchun:
            saju_year = year - 1
            
        # Year Pillar
        year_gan_idx = (saju_year - 4) % 10
        year_ji_idx = (saju_year - 4) % 12
        year_pillar = {
            "stem": HEAVENLY_STEMS[year_gan_idx],
            "branch": EARTHLY_BRANCHES[year_ji_idx]
        }
        
        # Month Pillar
        # Base Month is determined by Year Stem. (Wol-Du-Beop)
        # Year Stem 'Gap/Gi' -> Start Month 'Mu-In'
        # Formula for Month Stem start index:
        # (Year Stem Index % 5) * 2 + 2 (In month is 3rd branch, index 2?)
        
        check_year = saju_year
        # Terms for the SAJU YEAR (starting Feb 4)
        terms = [
            (datetime(check_year, 2, 4), 2),   # In
            (datetime(check_year, 3, 6), 3),   # Myo
            (datetime(check_year, 4, 5), 4),   # Jin
            (datetime(check_year, 5, 6), 5),   # Sa
            (datetime(check_year, 6, 6), 6),   # O
            (datetime(check_year, 7, 7), 7),   # Mi
            (datetime(check_year, 8, 8), 8),   # Shin
            (datetime(check_year, 9, 8), 9),   # Yu
            (datetime(check_year, 10, 8), 10), # Sul
            (datetime(check_year, 11, 7), 11), # Hae
            (datetime(check_year, 12, 7), 0),  # Ja
            (datetime(check_year + 1, 1, 6), 1)# Chuk
        ]
        
        # Find the month
        month_ji_idx = 1 # Default to last month of prev year (Chuk) if before first term?

        target_ji = 1 # Default
        for t_date, t_idx in terms:
            if birth_date >= t_date:
                target_ji = t_idx
            else:
                break
        
        month_ji_idx = target_ji
        
        # Month Stem (Wol-Du-Beop)
        month_start_gan_idx = (year_gan_idx % 5) * 2 + 2
        # Month branches start at In(2).
        
        # Branch Order in Saju Month Sequence: In(2), Myo(3)... Hae(11), Ja(0), Chuk(1)
        pass_chart = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]
        seq_idx = pass_chart.index(month_ji_idx)
        
        month_gan_idx = (month_start_gan_idx + seq_idx) % 10
        
        month_pillar = {
            "stem": HEAVENLY_STEMS[month_gan_idx],
            "branch": EARTHLY_BRANCHES[month_ji_idx]
        }


        # 3. Hour Pillar
        # Determined by Day Stem and Hour.
        # Formula: ((Hour + 1) // 2) % 12 maps to branch index.
        
        hour_ji_idx = ((hour + 1) // 2) % 12
        # If hour is 23 (11pm), (24//2) % 12 = 0 (Ja). Correct.
        
        # Hour Stem (Shi-Du-Beop)
        # Formula: (Day Stem Index % 5) * 2
        
        hour_start_gan_idx = (day_gan_idx % 5) * 2
        hour_gan_idx = (hour_start_gan_idx + hour_ji_idx) % 10
        
        hour_pillar = {
            "stem": HEAVENLY_STEMS[hour_gan_idx],
            "branch": EARTHLY_BRANCHES[hour_ji_idx]
        }
        
        return {
            "year": year_pillar,
            "month": month_pillar,
            "day": day_pillar,
            "hour": hour_pillar,
            "meta": {
                "year_gan": year_gan_idx, "year_ji": year_ji_idx,
                "month_gan": month_gan_idx, "month_ji": month_ji_idx,
                "day_gan": day_gan_idx, "day_ji": day_ji_idx,
                "hour_gan": hour_gan_idx, "hour_ji": hour_ji_idx
            }
        }

    def analyze_stats(self, pillars_data):
        meta = pillars_data["meta"]
        
        # Counts
        element_counts = {"Wood": 0, "Fire": 0, "Earth": 0, "Metal": 0, "Water": 0}
        
        # Add Stems
        element_counts[STEM_ELEMENTS[meta["year_gan"]]] += 1
        element_counts[STEM_ELEMENTS[meta["month_gan"]]] += 1
        element_counts[STEM_ELEMENTS[meta["day_gan"]]] += 1
        element_counts[STEM_ELEMENTS[meta["hour_gan"]]] += 1
        
        # Add Branches
        element_counts[BRANCH_ELEMENTS[meta["year_ji"]]] += 1
        element_counts[BRANCH_ELEMENTS[meta["month_ji"]]] += 1
        element_counts[BRANCH_ELEMENTS[meta["day_ji"]]] += 1
        element_counts[BRANCH_ELEMENTS[meta["hour_ji"]]] += 1
        
        # Determine Dominant
        dominant = max(element_counts, key=element_counts.get)
        
        # Determine Class based on Dominant Element + Day Master
        day_master_element = STEM_ELEMENTS[meta["day_gan"]]
        
        classes = self.data["classes"]
        class_descriptions = self.data["class_descriptions"]

        user_class = classes.get(dominant, "Wanderer")
        class_description = class_descriptions.get(dominant, "운명의 흐름을 여행하는 방랑자입니다.")
        
        
        # Detailed Interpretations based on Dominant Element
        interpretations = {
            "personality": self._get_interpretation("personality", dominant),
            "wealth": self._get_interpretation("wealth", dominant),
            "career": self._get_interpretation("career", dominant),
            "health": self._get_interpretation("health", dominant),
            "love": self._get_interpretation("love", dominant),
        }
        
        # Generate Detailed Report
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
"""

        return {
            "stats": element_counts,
            "class": user_class,
            "class_description": class_description,
            "dominant_element": dominant,
            "day_master": day_master_element,
            "interpretations": interpretations,
            "detailed_report": detailed_report.strip(),
            "message": f"You were born with the energy of {day_master_element}, and your chart is most strongly influenced by {dominant}."
        }

    def _get_interpretation(self, topic, dominant):
        # Use simple dictionary lookup from loaded data
        return self.data["interpretations"].get(topic, {}).get(dominant, "운명의 흐름을 스스로 개척해 나가는 힘이 있습니다.")

    def generate_deep_report(self, pillars_data):
        """
        Generates a deep, 10,000+ character report using Gemini API.
        """
        current_year = datetime.now().year
        current_date_str = datetime.now().strftime("%Y-%m-%d")

        if "GOOGLE_API_KEY" not in os.environ:
             return "## Error\n\nGoogle API Key is missing. Please configure the GOOGLE_API_KEY environment variable to unlock the Deep Destiny Report."

        # Use a supported model name (models/gemini-flash-latest)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Construct the Prompt
        prompt = f"""
        {MYUNGSEON_PERSONA}
        
        Analyze the following Saju (Four Pillars) Chart:
        
        **Birth Data**:
        - Year Pillar: {pillars_data['year']['stem']} {pillars_data['year']['branch']}
        - Month Pillar: {pillars_data['month']['stem']} {pillars_data['month']['branch']}
        - Day Pillar: {pillars_data['day']['stem']} {pillars_data['day']['branch']} (Day Master)
        - Hour Pillar: {pillars_data['hour']['stem']} {pillars_data['hour']['branch']}
        
        **Context**:
        - Current Date: {current_date_str} (The forecast for "Current Year" must focus on {current_year})
        
        **Meta Analysis**:
        - Dominant Element: {pillars_data.get('dominant_element', 'Unknown')}
        - Soul Class: {pillars_data.get('class', 'Unknown')}
        
        Write the "Book of Destiny" for this soul now.
        """
        
        try:
            response = model.generate_content(prompt)
            
            # Log usage metadata if available (to stderr to not break JSON)
            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                sys.stderr.write(f"[Token Usage] Input: {usage.prompt_token_count}, Output: {usage.candidates_token_count}, Total: {usage.total_token_count}\\n")
            
            return response.text
        except Exception as e:
            return f"## Error\n\nThe spirits are silent (API Error): {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Arg 1: Date (YYYY-MM-DD), Arg 2: Time (HH:MM), Arg 3: --deep (optional)
        date_str = sys.argv[1]
        time_str = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else "00:00"
        
        is_deep = "--deep" in sys.argv
        
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        
        engine = SajuEngine()
        pillars = engine.compute_saju(dt.year, dt.month, dt.day, dt.hour, dt.minute)
        analysis = engine.analyze_stats(pillars)
        
        # Merge results for output
        result = {
            **analysis,
            "pillars": {k: v for k, v in pillars.items() if k != "meta"}
        }
        
        if is_deep:
            # Pass full pillars data including meta to the AI
            deep_report_md = engine.generate_deep_report(pillars)
            result["deep_report"] = deep_report_md
        
        print(json.dumps(result, ensure_ascii=False))
    else:
        # Dummy test
        engine = SajuEngine()
        print(engine.compute_saju(2024, 2, 10, 14, 30))
