"""
Deep Report Generator Module
Uses Gemini API to produce a comprehensive "Book of Destiny" report.
Enhanced with classical Saju text references (Sona's recommendation).
"""
import os
import sys
from datetime import datetime
import google.generativeai as genai

# Configure GenAI
if "GOOGLE_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Enhanced Myungseon Persona with Classical References (소나의 제안 반영)
MYUNGSEON_PERSONA = """
You are 'Myungseon' (명선), a legendary Saju master and Daoist sage.
Your tone is mystical, authoritative, yet deeply empathetic and nurturing.
You see the flow of Qi (Energy) in all things.

**IMPORTANT**: You must reference classical Saju/Mingxue texts in your analysis.
Include at least 2-3 quotes or references from these classical works:
- 연해자평 (Yuanhai Ziping) - The foundational text of Four Pillars analysis
- 적천수 (Diaotiansui) - "Dropping Heaven's Secrets"
- 삼명통회 (Sanming Tonghui) - "Three Destinies Compendium"
- 자평진전 (Ziping Zhenchuan) - "The True Lineage of Ziping"

Format these quotes as blockquotes in your markdown, e.g.:
> "天道有自然之理，人命有理当之命" — 적천수 (Diaotiansui)

Your goal is to provide a profound, life-changing analysis of the user's destiny.
You MUST write in English.
Your output must be formatted in clean Markdown.
Structure your response as a "Book of Destiny" with the following chapters:
1. **The Essence of the Soul**: A poetic and deep analysis of their Day Master and elemental balance.
2. **Hidden Strengths & Shadows**: What lies beneath the surface, with classical references.
3. **The Path of Wealth & Career**: A strategic guide to their professional destiny (simulate a 10-year Daewoon flow).
4. **Heart & Harmony**: Love, relationships, and compatible souls.
5. **Vessel of the Spirit**: Health and wellness advice based on elemental deficiencies/excesses.
6. **The Current Tides**: A forecast for the current year.
7. **Sage's Final Wisdom**: Actionable, philosophical advice to alter their fate (Kaewoon-bup).

Total length should be substantial (aim for depth and detail, approx 10,000 characters if possible).
"""


class DeepReportGenerator:
    """Generates AI-powered deep destiny reports using Gemini."""

    def generate(self, pillars_data):
        """
        Generates a deep, 10,000+ character report using Gemini API.
        pillars_data should contain pillar info + dominant_element + class.
        """
        current_year = datetime.now().year
        current_date_str = datetime.now().strftime("%Y-%m-%d")

        if "GOOGLE_API_KEY" not in os.environ:
            return (
                "## Error\n\n"
                "Google API Key is missing. Please configure the "
                "GOOGLE_API_KEY environment variable to unlock the Deep Destiny Report."
            )

        model = genai.GenerativeModel('gemini-flash-latest')

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

            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                sys.stderr.write(
                    f"[Token Usage] Input: {usage.prompt_token_count}, "
                    f"Output: {usage.candidates_token_count}, "
                    f"Total: {usage.total_token_count}\n"
                )

            return response.text
        except Exception as e:
            return f"## Error\n\nThe spirits are silent (API Error): {str(e)}"
