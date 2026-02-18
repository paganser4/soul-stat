"""
Saju Calculator Module
Converts birth date/time to the Four Pillars (사주 - 年柱, 月柱, 日柱, 時柱).
"""
from datetime import datetime
from .constants import HEAVENLY_STEMS, EARTHLY_BRANCHES


class SajuCalculator:
    """Computes the Four Pillars of Destiny from birth data."""

    def compute(self, year, month, day, hour, minute=0):
        """
        Compute the Four Pillars based on Solar Terms.
        Returns dict with year/month/day/hour pillars and meta indices.
        """
        birth_date = datetime(year, month, day, hour, minute)

        # --- Day Pillar ---
        # Anchor: 1900-01-01 is Gap-Sul (甲戌) day
        base_date = datetime(1900, 1, 1)
        days_diff = (datetime(year, month, day) - base_date).days

        day_gan_idx = (0 + days_diff) % 10   # Gap is 0
        day_ji_idx = (10 + days_diff) % 12   # Sul is 10

        day_pillar = {
            "stem": HEAVENLY_STEMS[day_gan_idx],
            "branch": EARTHLY_BRANCHES[day_ji_idx]
        }

        # --- Year Pillar ---
        # Ipchun (입춘) ~ Feb 4 determines the Saju Year start
        current_year_ipchun = datetime(year, 2, 4, 0, 0)
        saju_year = year if birth_date >= current_year_ipchun else year - 1

        year_gan_idx = (saju_year - 4) % 10
        year_ji_idx = (saju_year - 4) % 12
        year_pillar = {
            "stem": HEAVENLY_STEMS[year_gan_idx],
            "branch": EARTHLY_BRANCHES[year_ji_idx]
        }

        # --- Month Pillar ---
        check_year = saju_year
        terms = [
            (datetime(check_year, 2, 4), 2),
            (datetime(check_year, 3, 6), 3),
            (datetime(check_year, 4, 5), 4),
            (datetime(check_year, 5, 6), 5),
            (datetime(check_year, 6, 6), 6),
            (datetime(check_year, 7, 7), 7),
            (datetime(check_year, 8, 8), 8),
            (datetime(check_year, 9, 8), 9),
            (datetime(check_year, 10, 8), 10),
            (datetime(check_year, 11, 7), 11),
            (datetime(check_year, 12, 7), 0),
            (datetime(check_year + 1, 1, 6), 1)
        ]

        target_ji = 1  # Default
        for t_date, t_idx in terms:
            if birth_date >= t_date:
                target_ji = t_idx
            else:
                break

        month_ji_idx = target_ji

        # Month Stem (월두법 / Wol-Du-Beop)
        month_start_gan_idx = (year_gan_idx % 5) * 2 + 2
        pass_chart = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]
        seq_idx = pass_chart.index(month_ji_idx)
        month_gan_idx = (month_start_gan_idx + seq_idx) % 10

        month_pillar = {
            "stem": HEAVENLY_STEMS[month_gan_idx],
            "branch": EARTHLY_BRANCHES[month_ji_idx]
        }

        # --- Hour Pillar ---
        hour_ji_idx = ((hour + 1) // 2) % 12

        # Hour Stem (시두법 / Shi-Du-Beop)
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
