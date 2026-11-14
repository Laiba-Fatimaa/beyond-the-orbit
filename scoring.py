"""
MISSION SCORING & EVALUATION ENGINE
===================================
BEYOND THE ORBIT - Space Mission Design Game
Computes transparent, objective mission evaluation across 6 categories:
1. Scientific Achievement (0-25)
2. Engineering Design & Architecture (0-20)
3. Resource & Budget Efficiency (0-15)
4. Spacecraft Reliability & Health (0-15)
5. Communication & Data Delivery (0-15)
6. Mission Operations & Decision-Making (0-10)

Total Score: 0 - 100 points.
"""

from typing import Dict, Any, List
from missions import get_mission

def evaluate_mission(
    mission_id: str,
    design_calc: Dict[str, Any],
    sim_state: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates the complete mission outcome and returns a detailed
    scored report with actionable lessons learned.
    """
    mission = get_mission(mission_id)
    comps = design_calc["selected_components"]

    # -------------------------------------------------------------
    # Category 1: Scientific Achievement (Max: 25 pts)
    # -------------------------------------------------------------
    # Derived from objectives matched and in-flight science points
    selected_inst_ids = set(i["id"] for i in comps["instruments"])
    matched_objectives: List[Dict[str, Any]] = []
    total_obj_points = 0
    earned_obj_points = 0

    for obj in mission["scientific_objectives"]:
        reqs = set(obj["instrument_req"])
        total_obj_points += obj["points"]
        match_intersection = reqs.intersection(selected_inst_ids)
        if len(match_intersection) == len(reqs):
            # Fully met
            earned_obj_points += obj["points"]
            matched_objectives.append({"title": obj["title"], "status": "Fully Achieved", "pct": 100})
        elif len(match_intersection) > 0:
            # Partially met
            partial = obj["points"] * 0.6
            earned_obj_points += partial
            matched_objectives.append({"title": obj["title"], "status": "Partially Achieved", "pct": 60})
        else:
            matched_objectives.append({"title": obj["title"], "status": "Unfulfilled (Missing Instruments)", "pct": 0})

    objective_ratio = (earned_obj_points / max(1.0, total_obj_points))
    # Combine with flight science discoveries (from simulation events)
    flight_science = min(sim_state.get("science_points", 0.0), 120.0) / 120.0
    science_score = round(min(25.0, (objective_ratio * 15.0) + (flight_science * 10.0)), 1)

    # -------------------------------------------------------------
    # Category 2: Engineering Design & Architecture (Max: 20 pts)
    # -------------------------------------------------------------
    # Mass margin compliance (NASA 15-20% guideline)
    mass_margin_pct = design_calc.get("mass_margin_pct", 0.0)
    if mass_margin_pct >= 15.0:
        mass_score = 7.0
    elif mass_margin_pct >= 5.0:
        mass_score = 5.0
    elif mass_margin_pct >= 0.0:
        mass_score = 3.0
    else:
        mass_score = 0.0

    # Power balance & margin
    pwr_balance = design_calc.get("power_balance_w", 0.0)
    if pwr_balance >= 50.0:
        pwr_score = 7.0
    elif pwr_balance >= 0.0:
        pwr_score = 5.0
    elif pwr_balance >= -20.0:
        pwr_score = 3.0
    else:
        pwr_score = 1.0

    # Architecture synergy (architecture match to destination)
    arch_score = 6.0 if design_calc["validation_status"] == "READY FOR LAUNCH" else (
        4.0 if design_calc["validation_status"] == "NEEDS ATTENTION" else 1.0
    )
    engineering_score = round(min(20.0, mass_score + pwr_score + arch_score), 1)

    # -------------------------------------------------------------
    # Category 3: Resource & Budget Efficiency (Max: 15 pts)
    # -------------------------------------------------------------
    budget_margin_pct = design_calc.get("budget_margin_pct", 0.0)
    if 5.0 <= budget_margin_pct <= 25.0:
        # Ideal balanced budget
        budget_score = 15.0
    elif budget_margin_pct > 25.0:
        # Too conservative; left too much capability on the table
        budget_score = 12.0
    elif 0.0 <= budget_margin_pct < 5.0:
        # Extremely tight margin
        budget_score = 9.0
    else:
        # Over budget
        budget_score = 2.0
    resource_score = round(budget_score, 1)

    # -------------------------------------------------------------
    # Category 4: Spacecraft Reliability & Health (Max: 15 pts)
    # -------------------------------------------------------------
    final_health = sim_state.get("health_pct", 100.0)
    base_reliability = design_calc.get("composite_reliability_pct", 85.0)
    # Blend pre-flight predicted reliability and actual surviving health
    rel_score = (base_reliability / 100.0 * 6.0) + (final_health / 100.0 * 9.0)
    reliability_score = round(min(15.0, rel_score), 1)

    # -------------------------------------------------------------
    # Category 5: Communication & Data Delivery (Max: 15 pts)
    # -------------------------------------------------------------
    data_col = max(1.0, sim_state.get("data_collected_mb", 100.0))
    data_tx = sim_state.get("data_transmitted_mb", 50.0)
    delivery_ratio = min(1.0, data_tx / data_col)
    
    # Ground segment adequacy
    ground_id = comps["ground_segment"]["id"]
    dest_name = mission["destination"]
    if dest_name == "Europa":
        ground_pts = 5.0 if ground_id == "ground_dsn_70m" else (3.5 if ground_id == "ground_dsn_34m" else 1.0)
    elif dest_name == "Mars":
        ground_pts = 5.0 if ground_id in ["ground_dsn_34m", "ground_dsn_70m"] else (3.0 if ground_id == "ground_nsn" else 1.5)
    else: # Moon
        ground_pts = 5.0 if ground_id != "ground_university" else 3.5

    data_score = round(min(15.0, (delivery_ratio * 10.0) + ground_pts), 1)

    # -------------------------------------------------------------
    # Category 6: Mission Operations & Decision-Making (Max: 10 pts)
    # -------------------------------------------------------------
    # Evaluated from choices made during mission events
    log = sim_state.get("log", [])
    ops_pts = 6.0 # Baseline starting score
    for item in log:
        conseq = item.get("consequence", "")
        if "SPECTACULAR" in conseq or "TRIUMPH" in conseq or "HISTORIC" in conseq or "MONUMENTAL" in conseq or "SUCCESS" in conseq or "NASA GOLD STANDARD" in conseq:
            ops_pts += 1.2
        elif "WARNING" in conseq or "CAUTION" in conseq or "BROWNOUT" in conseq or "DAMAGE" in conseq:
            ops_pts -= 0.8
    operations_score = round(max(2.0, min(10.0, ops_pts)), 1)

    # -------------------------------------------------------------
    # Total Score & Outcome
    # -------------------------------------------------------------
    total_score = round(
        science_score
        + engineering_score
        + resource_score
        + reliability_score
        + data_score
        + operations_score,
        1
    )

    if total_score >= 85.0:
        outcome = "MISSION SUCCESS"
        outcome_color = "#43D9FF" # Cyan
        outcome_badge = "★ OUTSTANDING MISSION SUCCESS ★"
        summary_text = (
            "The mission achieved exemplary scientific breakthroughs while maintaining "
            "stringent aerospace engineering margins and telemetry links. Your design choices "
            "provided the robustness necessary to overcome planetary hazards."
        )
    elif total_score >= 60.0:
        outcome = "PARTIAL SUCCESS"
        outcome_color = "#FFB547" # Amber
        outcome_badge = "◆ QUALIFIED PARTIAL SUCCESS ◆"
        summary_text = (
            "The mission returned valuable scientific data and demonstrated core capabilities, "
            "but encountered operational stress due to subsystem bottlenecks or resource constraints."
        )
    else:
        outcome = "MISSION FAILURE"
        outcome_color = "#FF5263" # Red
        outcome_badge = "✖ CRITICAL MISSION FAILURE ✖"
        summary_text = (
            "The spacecraft succumbed to environmental hazards, power starvation, or telemetry loss. "
            "Critical mission objectives were left unfulfilled."
        )

    # -------------------------------------------------------------
    # Lessons Learned & Recommendations
    # -------------------------------------------------------------
    lessons_learned: List[str] = []
    suggestions: List[str] = []

    if mass_margin_pct < 15.0:
        lessons_learned.append(
            f"Tight Mass Contingency ({mass_margin_pct}%): As documented in the NASA Systems Engineering "
            "Handbook, early design phases require 15–20% mass margins to absorb instrument growth."
        )
        suggestions.append("Upgrade to a heavier launch vehicle class or select composite CFRP structures to restore mass margin.")

    if design_calc.get("power_balance_w", 0.0) < 0.0:
        lessons_learned.append(
            "Power Deficit: Negative power balance forced frequent instrument duty-cycling and "
            "reliance on battery depth of discharge."
        )
        suggestions.append("Consider high-efficiency Gallium-Arsenide UltraFlex arrays or MMRTG nuclear power.")

    if dest_name == "Europa" and comps["structure"]["id"] != "struct_vault":
        lessons_learned.append(
            "Jovian Radiation Penetration: Unshielded structural buses allow high-energy electrons "
            "to induce cumulative ionizing doses on avionics."
        )
        suggestions.append("Always equip deep Jovian missions with a Radiation-Hardened Tantalum/Titanium Vault.")

    if delivery_ratio < 0.7:
        lessons_learned.append(
            f"Data Downlink Choke ({round(delivery_ratio * 100, 1)}% delivered): Scientific instruments "
            "generated more telemetry than the ground communication link could extract."
        )
        suggestions.append("Upgrade to NASA Deep Space Network 70m antenna support or install a high-bandwidth Ka-band/Optical dish.")

    if not lessons_learned:
        lessons_learned.append(
            "Balanced Architecture: All subsystems demonstrated healthy synergy. Mass, power, "
            "and communication links remained in equilibrium throughout the flight."
        )
        suggestions.append("Challenge yourself by tackling the Europa Frontier mission or reducing launch vehicle costs.")

    return {
        "total_score": total_score,
        "outcome": outcome,
        "outcome_color": outcome_color,
        "outcome_badge": outcome_badge,
        "summary_text": summary_text,
        "categories": {
            "scientific_achievement": {
                "name": "Scientific Achievement",
                "score": science_score,
                "max": 25.0,
                "pct": round((science_score / 25.0) * 100, 1)
            },
            "engineering_design": {
                "name": "Engineering Design & Margins",
                "score": engineering_score,
                "max": 20.0,
                "pct": round((engineering_score / 20.0) * 100, 1)
            },
            "resource_efficiency": {
                "name": "Resource & Budget Efficiency",
                "score": resource_score,
                "max": 15.0,
                "pct": round((resource_score / 15.0) * 100, 1)
            },
            "spacecraft_health": {
                "name": "Spacecraft Reliability & Health",
                "score": reliability_score,
                "max": 15.0,
                "pct": round((reliability_score / 15.0) * 100, 1)
            },
            "communication_data": {
                "name": "Communication & Data Delivery",
                "score": data_score,
                "max": 15.0,
                "pct": round((data_score / 15.0) * 100, 1)
            },
            "mission_operations": {
                "name": "Operations & In-Flight Decisions",
                "score": operations_score,
                "max": 10.0,
                "pct": round((operations_score / 10.0) * 100, 1)
            }
        },
        "matched_objectives": matched_objectives,
        "data_stats": {
            "collected_mb": sim_state.get("data_collected_mb", 0.0),
            "transmitted_mb": sim_state.get("data_transmitted_mb", 0.0),
            "delivery_rate_pct": round(delivery_ratio * 100.0, 1)
        },
        "final_health_pct": final_health,
        "final_power_pct": sim_state.get("power_pct", 100.0),
        "lessons_learned": lessons_learned,
        "suggestions": suggestions
    }

