"""
Shared constants for the Saju Engine.
Heavenly Stems, Earthly Branches, Five Elements mappings.
"""

# 천간 (Heavenly Stems)
HEAVENLY_STEMS = [
    "Yang Wood (甲)", "Yin Wood (乙)",
    "Yang Fire (丙)", "Yin Fire (丁)",
    "Yang Earth (戊)", "Yin Earth (己)",
    "Yang Metal (庚)", "Yin Metal (辛)",
    "Yang Water (壬)", "Yin Water (癸)"
]

# 지지 (Earthly Branches)
EARTHLY_BRANCHES = [
    "Rat (子)", "Ox (丑)", "Tiger (寅)", "Rabbit (卯)",
    "Dragon (辰)", "Snake (巳)", "Horse (午)", "Sheep (未)",
    "Monkey (申)", "Rooster (酉)", "Dog (戌)", "Pig (亥)"
]

# 오행 매핑 (Five Elements)
STEM_ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"]
BRANCH_ELEMENTS = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"]

def get_element(idx, is_stem=True):
    """Get the Five Element name for a given stem/branch index."""
    if is_stem:
        return STEM_ELEMENTS[idx]
    return BRANCH_ELEMENTS[idx]
