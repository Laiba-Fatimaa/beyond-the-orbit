"""
GAME LOGIC & MISSION VALIDATION ENGINE
=======================================
BEYOND THE ORBIT - Space Mission Design Game
Handles all live calculations, engineering trade-offs,
NASA margin checks, and validation status (Ready, Attention, Blocked).
"""

from typing import Dict, Any, List, Tuple
from missions import get_mission
from spacecraft import (
    LAUNCH_VEHICLES,
    STRUCTURE_OPTIONS,
    POWER_GENERATION_OPTIONS,
    BATTERY_OPTIONS,
    COMMUNICATION_OPTIONS,
    AVIONICS_OPTIONS,
    PROPULSION_OPTIONS,
    THERMAL_OPTIONS,
    INSTRUMENT_CATALOG,
    GROUND_SEGMENT_OPTIONS,
    USER_SEGMENT_OPTIONS
)
from nasa_data import PLANETARY_DATA

def calculate_mission_design(mission_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes all mission parameters, budgets, power balances,
    data rates, reliability, and scientific values.
    """
    mission = get_mission(mission_id)
    dest_name = mission["destination"]
    dest_data = PLANETARY_DATA.get(dest_name, {})
    env = mission["environmental_threats"]

    # 1. Resolve selected components
    lv = LAUNCH_VEHICLES.get(config.get("launch_vehicle", "lv_medium"), LAUNCH_VEHICLES["lv_medium"])
    struct = STRUCTURE_OPTIONS.get(config.get("structure", "struct_aluminum"), STRUCTURE_OPTIONS["struct_aluminum"])
    pwr_gen = POWER_GENERATION_OPTIONS.get(config.get("power_gen", "pwr_silicon"), POWER_GENERATION_OPTIONS["pwr_silicon"])
    bat = BATTERY_OPTIONS.get(config.get("battery", "bat_li_ion"), BATTERY_OPTIONS["bat_li_ion"])
    comm = COMMUNICATION_OPTIONS.get(config.get("comms", "comm_x_band"), COMMUNICATION_OPTIONS["comm_x_band"])
    avionics = AVIONICS_OPTIONS.get(config.get("avionics", "av_cots"), AVIONICS_OPTIONS["av_cots"])
    prop = PROPULSION_OPTIONS.get(config.get("propulsion", "prop_cold_gas"), PROPULSION_OPTIONS["prop_cold_gas"])
    thermal = THERMAL_OPTIONS.get(config.get("thermal", "thm_passive"), THERMAL_OPTIONS["thm_passive"])
    ground = GROUND_SEGMENT_OPTIONS.get(config.get("ground_segment", "ground_nsn"), GROUND_SEGMENT_OPTIONS["ground_nsn"])
    user_seg = USER_SEGMENT_OPTIONS.get(config.get("user_segment", "user_academic"), USER_SEGMENT_OPTIONS["user_academic"])

    # Resolve Architecture
    arch_id = config.get("architecture", "")
    arch = None
    for a in mission["suggested_architectures"]:
        if a["id"] == arch_id:
            arch = a
            break
    if not arch:
        arch = mission["suggested_architectures"][0]

    # Resolve Instruments
    selected_inst_ids = config.get("instruments", [])
    instruments = [INSTRUMENT_CATALOG[i_id] for i_id in selected_inst_ids if i_id in INSTRUMENT_CATALOG]

    # 2. Total Mass Calculation (kg)
    subsystems_mass = (
        struct["mass_kg"]
        + pwr_gen["mass_kg"]
        + bat["mass_kg"]
        + comm["mass_kg"]
        + avionics["mass_kg"]
        + prop["mass_kg"]
        + thermal["mass_kg"]
    )
    instruments_mass = sum(inst["mass_kg"] for inst in instruments)
    arch_mass = arch.get("complexity_mass", 0.0)
    total_spacecraft_mass = round(subsystems_mass + instruments_mass + arch_mass, 1)

    # Launch Vehicle Capacity for destination
    lv_max_payload = lv["max_payload_kg"].get(dest_name, 1000.0)
    mass_margin_kg = round(lv_max_payload - total_spacecraft_mass, 1)
    mass_margin_pct = round((mass_margin_kg / lv_max_payload) * 100.0, 1)

    # 3. Total Mission Cost Calculation ($ Millions)
    subsystems_cost = (
        struct["cost_million"]
        + pwr_gen["cost_million"]
        + bat["cost_million"]
        + comm["cost_million"]
        + avionics["cost_million"]
        + prop["cost_million"]
        + thermal["cost_million"]
    )
    instruments_cost = sum(inst["cost_million"] for inst in instruments)
    total_mission_cost = round(
        lv["cost_million"]
        + arch.get("complexity_cost", 0.0)
        + subsystems_cost
        + instruments_cost
        + ground["cost_million"]
        + user_seg["cost_million"],
        1
    )
    budget_allocated = mission["budget_million"]
    budget_margin_million = round(budget_allocated - total_mission_cost, 1)
    budget_margin_pct = round((budget_margin_million / budget_allocated) * 100.0, 1)

    # 4. Power Balance (Watts)
    # Solar depends on distance: inverse-square law
    if pwr_gen["type"] == "solar":
        solar_flux_scale = env.get("solar_flux_scale", 1.0)
        power_generation_w = round(pwr_gen["base_power_w"] * solar_flux_scale, 1)
    else: # Nuclear MMRTG (constant output regardless of distance)
        power_generation_w = float(pwr_gen["base_power_w"])

    # Power consumption
    bus_consumption_w = (
        comm["power_w"] * 0.45 # Average duty cycle
        + avionics["power_w"]
        + prop["power_w"] * 0.25
        + thermal["power_w"]
    )
    instruments_consumption_w = sum(inst["power_w"] for inst in instruments)
    total_power_consumption_w = round(bus_consumption_w + instruments_consumption_w, 1)
    power_balance_w = round(power_generation_w - total_power_consumption_w, 1)

    # Battery endurance during darkness (hours)
    # Avoid zero division
    effective_discharge_rate = max(total_power_consumption_w, 10.0)
    darkness_survival_hours = round(bat["capacity_wh"] / effective_discharge_rate, 1)

    # 5. Data Generation vs Downlink Bandwidth (MB / Earth Day)
    daily_data_generated_mb = sum(inst["data_rate_mb_day"] for inst in instruments)
    
    # Downlink capability considers:
    # - Spacecraft Comm max data rate
    # - Ground station contact hours (e.g. 18 hrs / 24 hrs)
    # - Ground station receiver sensitivity / efficiency
    # - Distance attenuation factor (Moon: 1.0, Mars: 0.75, Europa: 0.40)
    dist_attenuation = 1.0 if dest_name == "Moon" else (0.75 if dest_name == "Mars" else 0.40)
    daily_downlink_capacity_mb = round(
        comm["max_data_rate_mb_day"]
        * (ground["contact_hours_day"] / 24.0)
        * ground["downlink_efficiency"]
        * dist_attenuation
        * (arch.get("comm_window_pct", 85) / 100.0),
        1
    )
    data_balance_mb = round(daily_downlink_capacity_mb - daily_data_generated_mb, 1)

    # 6. Composite Spacecraft Reliability (%)
    # Multiplicative reliability across core subsystems
    base_rel = (
        struct["reliability"]
        * pwr_gen["reliability"]
        * bat["reliability"]
        * comm["reliability"]
        * avionics["reliability"]
        * prop["reliability"]
        * thermal["reliability"]
        * ground["reliability"]
    )
    # Environmental radiation penalty
    rad_pen = 1.0
    if dest_name == "Europa":
        # Europa has extreme radiation; titanium vault gives 3.8 shielding
        shield = struct.get("radiation_shielding", 1.0)
        if shield < 2.0:
            rad_pen = 0.65 # Severe degradation without vault!
        elif shield < 3.5:
            rad_pen = 0.88
        else:
            rad_pen = 0.98
    elif dest_name == "Mars":
        shield = struct.get("radiation_shielding", 1.0)
        if shield < 1.1:
            rad_pen = 0.90

    composite_reliability = round(base_rel * rad_pen * 100.0, 1)

    # 7. Scientific Value & Objective Match
    raw_science_score = sum(inst["science_val"] for inst in instruments)
    # Check match with mission objectives
    objs_achieved_count = 0
    selected_inst_set = set(selected_inst_ids)
    for obj in mission["scientific_objectives"]:
        reqs = set(obj["instrument_req"])
        if reqs.intersection(selected_inst_set): # Partially or fully satisfied
            objs_achieved_count += 1

    science_multiplier = arch.get("science_multiplier", 1.0) * user_seg.get("science_pipeline_multiplier", 1.0)
    projected_science_yield = round(raw_science_score * science_multiplier, 1)

    # 8. Validation Rules (Blocked, Needs Attention, Ready)
    blockers: List[str] = []
    warnings: List[str] = []
    confirmations: List[str] = []

    # Check Mass
    if total_spacecraft_mass > lv_max_payload:
        blockers.append(
            f"Launch Overload: Spacecraft mass ({total_spacecraft_mass} kg) exceeds "
            f"the {lv['name']} limit ({lv_max_payload} kg) for {dest_name}."
        )
    elif mass_margin_pct < 15.0:
        warnings.append(
            f"Tight Mass Margin: Mass margin is {mass_margin_pct}% ({mass_margin_kg} kg). "
            f"NASA Systems Engineering standard recommends a 15–20% contingency margin."
        )
    else:
        confirmations.append(
            f"Mass Envelope Verified: {mass_margin_kg} kg remaining ({mass_margin_pct}% margin)."
        )

    # Check Budget
    if total_mission_cost > budget_allocated:
        blockers.append(
            f"Budget Breach: Total cost (${total_mission_cost}M) exceeds the "
            f"${budget_allocated}M allocated budget by ${abs(budget_margin_million)}M."
        )
    elif budget_margin_pct < 5.0:
        warnings.append(
            f"Low Financial Reserve: Budget margin is only ${budget_margin_million}M ({budget_margin_pct}%). "
            f"Any unexpected launch delay or rework could cause fiscal failure."
        )
    else:
        confirmations.append(
            f"Fiscal Plan Approved: ${budget_margin_million}M reserve remaining ({budget_margin_pct}%)."
        )

    # Check Instruments
    if not instruments:
        blockers.append("No Scientific Instruments: Cannot launch a science mission with zero payload.")
    else:
        confirmations.append(f"Payload Active: {len(instruments)} instruments installed.")

    # Check Power Physics
    if dest_name == "Europa" and pwr_gen["type"] == "solar" and pwr_gen["id"] == "pwr_silicon":
        blockers.append(
            "Fatal Power Starvation: Standard silicon solar panels at Jupiter/Europa "
            f"generate only {power_generation_w} W due to 1/r² solar law. MMRTG nuclear power "
            "or massive advanced UltraFlex arrays are required."
        )
    elif power_generation_w < (bus_consumption_w * 0.75):
        blockers.append(
            f"Severe Bus Power Deficit: Continuous generation ({power_generation_w} W) cannot "
            f"sustain baseline housekeeping bus load ({bus_consumption_w:.0f} W). "
            "Spacecraft will drain batteries and suffer brownout during cruise."
        )
    elif power_balance_w < 0.0:
        warnings.append(
            f"Negative Continuous Power Balance: Simultaneous operation of all instruments "
            f"requires {total_power_consumption_w} W, exceeding generation ({power_generation_w} W) by {abs(power_balance_w)} W. "
            f"Flight software must duty-cycle instruments and rely on battery reserves ({bat['capacity_wh']} Wh) during encounter passes."
        )
    else:
        confirmations.append(
            f"Power Positive: Net surplus of +{power_balance_w} W during regular operational duty."
        )

    # Check Ground Segment Compatibility
    if dest_name == "Europa" and ground["id"] == "ground_university":
        blockers.append(
            "Telecommunications Loss: University ground station lacks the RF sensitivity "
            "to receive faint telemetry across 628M km from Europa. NASA DSN 34m or 70m required."
        )
    elif dest_name == "Mars" and ground["id"] == "ground_university":
        warnings.append(
            "Severe Downlink Bottleneck: University station provides only 4h/day contact. "
            "Data overflow will occur; ground tracking handover is recommended."
        )

    # Check Data Throughput
    if daily_data_generated_mb > daily_downlink_capacity_mb:
        warnings.append(
            f"Data Downlink Lag: Instruments generate {daily_data_generated_mb} MB/day, "
            f"exceeding downlink capacity ({daily_downlink_capacity_mb} MB/day). "
            "Onboard storage will fill up unless higher-gain comms or DSN contact is selected."
        )
    else:
        confirmations.append(
            f"Data Highway Clear: Downlink throughput ({daily_downlink_capacity_mb} MB/day) "
            f"comfortably exceeds science generation ({daily_data_generated_mb} MB/day)."
        )

    # Check Radiation Protection for Europa / Mars
    if dest_name == "Europa" and struct["id"] != "struct_vault":
        warnings.append(
            "Radiation Vulnerability: Europa is inside Jupiter's lethal radiation belts. "
            "Without the Radiation-Hardened Vault, avionics and instruments face rapid degradation."
        )

    # Final Validation Status
    if blockers:
        validation_status = "LAUNCH BLOCKED"
    elif warnings:
        validation_status = "NEEDS ATTENTION"
    else:
        validation_status = "READY FOR LAUNCH"

    return {
        "validation_status": validation_status,
        "blockers": blockers,
        "warnings": warnings,
        "confirmations": confirmations,
        "total_mass_kg": total_spacecraft_mass,
        "lv_max_payload_kg": lv_max_payload,
        "mass_margin_kg": mass_margin_kg,
        "mass_margin_pct": mass_margin_pct,
        "total_cost_million": total_mission_cost,
        "budget_million": budget_allocated,
        "budget_margin_million": budget_margin_million,
        "budget_margin_pct": budget_margin_pct,
        "power_generation_w": power_generation_w,
        "power_consumption_w": total_power_consumption_w,
        "power_balance_w": power_balance_w,
        "darkness_survival_hours": darkness_survival_hours,
        "daily_data_generated_mb": daily_data_generated_mb,
        "daily_downlink_capacity_mb": daily_downlink_capacity_mb,
        "data_balance_mb": data_balance_mb,
        "composite_reliability_pct": composite_reliability,
        "projected_science_yield": projected_science_yield,
        "objs_achieved_count": objs_achieved_count,
        "selected_components": {
            "launch_vehicle": lv,
            "architecture": arch,
            "structure": struct,
            "power_gen": pwr_gen,
            "battery": bat,
            "comms": comm,
            "avionics": avionics,
            "propulsion": prop,
            "thermal": thermal,
            "instruments": instruments,
            "ground_segment": ground,
            "user_segment": user_seg
        }
    }

