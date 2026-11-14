"""
MISSION REPORT GENERATOR
========================
BEYOND THE ORBIT - Space Mission Design Game
Generates downloadable, printable Mission Debrief Reports in both
standalone HTML and PDF formats. Aligned with NASA Space Apps Challenge 2026.
"""

from typing import Dict, Any
import io

def generate_html_report(
    mission_id: str,
    mission_data: Dict[str, Any],
    design_calc: Dict[str, Any],
    sim_state: Dict[str, Any],
    score_report: Dict[str, Any]
) -> str:
    """Generates a complete, beautifully styled standalone HTML mission report."""
    comps = design_calc["selected_components"]
    cats = score_report["categories"]
    outcome = score_report["outcome"]
    badge = score_report["outcome_badge"]
    score = score_report["total_score"]
    color = score_report["outcome_color"]

    log_rows = ""
    for idx, item in enumerate(sim_state.get("log", []), 1):
        log_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #1E2D4A; color: #43D9FF; font-weight: bold;">{item.get('phase', 'Phase')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #1E2D4A; color: #F4F7FF;">{item.get('event_title', 'Event')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #1E2D4A; color: #9BAAC2;">{item.get('choice_text', 'Choice')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #1E2D4A; color: #E0E8F5;">{item.get('consequence', 'Result')}</td>
        </tr>
        """

    obj_rows = ""
    for obj in score_report.get("matched_objectives", []):
        st_color = "#43D9FF" if "Fully" in obj['status'] else ("#FFB547" if "Partially" in obj['status'] else "#FF5263")
        obj_rows += f"""
        <li style="margin-bottom: 6px; color: #E0E8F5;">
            <strong>{obj['title']}</strong> — <span style="color: {st_color}; font-weight: bold;">{obj['status']}</span>
        </li>
        """

    lessons_rows = "".join(f"<li style='margin-bottom: 6px; color: #CAD5E8;'>{l}</li>" for l in score_report.get("lessons_learned", []))
    suggestions_rows = "".join(f"<li style='margin-bottom: 6px; color: #CAD5E8;'>{s}</li>" for s in score_report.get("suggestions", []))

    inst_names = ", ".join(i["name"] for i in comps["instruments"]) if comps["instruments"] else "None"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BEYOND THE ORBIT — Flight Debrief Report ({mission_data['name']})</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #060B18;
            color: #F4F7FF;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }}
        .report-card {{
            max-width: 900px;
            margin: 0 auto;
            background-color: #0B1224;
            border: 1px solid #1E2D4A;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.6);
        }}
        .header {{
            border-bottom: 2px solid #1E2D4A;
            padding-bottom: 20px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .title {{
            font-size: 26px;
            font-weight: 800;
            color: #43D9FF;
            letter-spacing: 1px;
            margin: 0;
        }}
        .subtitle {{
            font-size: 13px;
            color: #9BAAC2;
            margin-top: 4px;
        }}
        .badge-box {{
            text-align: right;
        }}
        .score-pill {{
            display: inline-block;
            font-size: 28px;
            font-weight: 900;
            color: {color};
            border: 2px solid {color};
            padding: 4px 18px;
            border-radius: 8px;
            background: rgba(6, 11, 24, 0.6);
        }}
        .grid-2 {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }}
        .panel {{
            background: #101B30;
            border: 1px solid #1F2D48;
            border-radius: 8px;
            padding: 16px;
        }}
        .panel h3 {{
            margin-top: 0;
            color: #43D9FF;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #1F2D48;
            padding-bottom: 8px;
        }}
        .metric-row {{
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 13px;
        }}
        .metric-label {{ color: #9BAAC2; }}
        .metric-val {{ color: #F4F7FF; font-weight: 600; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 10px;
        }}
        th {{
            text-align: left;
            background: #101B30;
            padding: 10px 8px;
            color: #9BAAC2;
            border-bottom: 2px solid #1E2D4A;
        }}
        .footer {{
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #1E2D4A;
            text-align: center;
            font-size: 11px;
            color: #6C7D9B;
        }}
        @media print {{
            body {{ background: white; color: black; padding: 0; }}
            .report-card {{ border: none; box-shadow: none; background: white; color: black; }}
            .panel {{ background: #f5f5f5; border: 1px solid #ccc; }}
            .metric-val {{ color: black; }}
            .metric-label {{ color: #555; }}
            th {{ background: #eee; color: #333; }}
        }}
    </style>
</head>
<body>
    <div class="report-card">
        <div class="header">
            <div>
                <h1 class="title">BEYOND THE ORBIT</h1>
                <div class="subtitle">NASA SPACE APPS CHALLENGE 2026 | TEAM ORBITERA</div>
                <div style="font-size: 15px; margin-top: 8px; font-weight: bold; color: #E0E8F5;">
                    Mission: {mission_data['name']} ({mission_data['destination']})
                </div>
            </div>
            <div class="badge-box">
                <div class="score-pill">{score} / 100</div>
                <div style="color: {color}; font-size: 12px; font-weight: bold; margin-top: 6px;">{badge}</div>
            </div>
        </div>

        <div class="panel" style="margin-bottom: 20px;">
            <h3>Mission Executive Summary</h3>
            <p style="margin: 0; font-size: 14px; color: #CAD5E8;">{score_report['summary_text']}</p>
        </div>

        <div class="grid-2">
            <div class="panel">
                <h3>Four-Segment Spacecraft Architecture</h3>
                <div class="metric-row"><span class="metric-label">Launch Segment:</span><span class="metric-val">{comps['launch_vehicle']['name']}</span></div>
                <div class="metric-row"><span class="metric-label">Total Mass:</span><span class="metric-val">{design_calc['total_mass_kg']} kg ({design_calc['mass_margin_pct']}% margin)</span></div>
                <div class="metric-row"><span class="metric-label">Mission Budget:</span><span class="metric-val">${design_calc['total_cost_million']}M / ${design_calc['budget_million']}M</span></div>
                <div class="metric-row"><span class="metric-label">Power System:</span><span class="metric-val">{comps['power_gen']['name']} ({design_calc['power_generation_w']}W)</span></div>
                <div class="metric-row"><span class="metric-label">Propulsion / ADCS:</span><span class="metric-val">{comps['propulsion']['name']}</span></div>
                <div class="metric-row"><span class="metric-label">Ground Segment:</span><span class="metric-val">{comps['ground_segment']['name']}</span></div>
                <div class="metric-row"><span class="metric-label">User Segment:</span><span class="metric-val">{comps['user_segment']['name']}</span></div>
                <div class="metric-row"><span class="metric-label">Active Payload:</span><span class="metric-val">{inst_names}</span></div>
            </div>

            <div class="panel">
                <h3>Evaluation Scorecard (100-Point Model)</h3>
                <div class="metric-row"><span class="metric-label">Scientific Achievement:</span><span class="metric-val">{cats['scientific_achievement']['score']} / 25.0</span></div>
                <div class="metric-row"><span class="metric-label">Engineering Design:</span><span class="metric-val">{cats['engineering_design']['score']} / 20.0</span></div>
                <div class="metric-row"><span class="metric-label">Resource Efficiency:</span><span class="metric-val">{cats['resource_efficiency']['score']} / 15.0</span></div>
                <div class="metric-row"><span class="metric-label">Spacecraft Health:</span><span class="metric-val">{cats['spacecraft_health']['score']} / 15.0</span></div>
                <div class="metric-row"><span class="metric-label">Comms & Data Delivery:</span><span class="metric-val">{cats['communication_data']['score']} / 15.0</span></div>
                <div class="metric-row"><span class="metric-label">Mission Operations:</span><span class="metric-val">{cats['mission_operations']['score']} / 10.0</span></div>
                <div class="metric-row" style="margin-top: 8px; border-top: 1px solid #1F2D48; padding-top: 8px;">
                    <span class="metric-label" style="color: #43D9FF; font-weight: bold;">Final Total Score:</span>
                    <span class="metric-val" style="color: {color}; font-size: 16px;">{score} / 100</span>
                </div>
            </div>
        </div>

        <div class="panel" style="margin-bottom: 20px;">
            <h3>Scientific Objectives Status</h3>
            <ul style="padding-left: 20px; margin: 0;">
                {obj_rows}
            </ul>
        </div>

        <div class="panel" style="margin-bottom: 20px;">
            <h3>In-Flight Telemetry & Operational Event Log</h3>
            <table>
                <thead>
                    <tr>
                        <th>Mission Phase</th>
                        <th>Event Scenario</th>
                        <th>Command Decision</th>
                        <th>Outcome / Consequence</th>
                    </tr>
                </thead>
                <tbody>
                    {log_rows}
                </tbody>
            </table>
        </div>

        <div class="grid-2">
            <div class="panel">
                <h3>Systems Engineering Lessons Learned</h3>
                <ul style="padding-left: 20px; margin: 0;">
                    {lessons_rows}
                </ul>
            </div>
            <div class="panel">
                <h3>Next Mission Recommendations</h3>
                <ul style="padding-left: 20px; margin: 0;">
                    {suggestions_rows}
                </ul>
            </div>
        </div>

        <div class="footer">
            BEYOND THE ORBIT — Space Mission Design Simulation | Built for NASA Space Apps Challenge 2026 | Verified NASA SMD Four-Segment Model
        </div>
    </div>
</body>
</html>"""
    return html


def generate_pdf_report(
    mission_id: str,
    mission_data: Dict[str, Any],
    design_calc: Dict[str, Any],
    sim_state: Dict[str, Any],
    score_report: Dict[str, Any]
) -> bytes:
    """Generates PDF mission report bytes using ReportLab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#060B18'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#4A5568'),
            spaceAfter=14
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1E3A8A'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#1F2937')
        )

        story.append(Paragraph("BEYOND THE ORBIT — MISSION FLIGHT DEBRIEF", title_style))
        story.append(Paragraph(
            f"<b>NASA Space Apps Challenge 2026 | Team Orbitera</b><br/>"
            f"Mission: <b>{mission_data['name']}</b> ({mission_data['destination']}) — "
            f"Result: <b>{score_report['outcome']} ({score_report['total_score']} / 100)</b>",
            subtitle_style
        ))
        story.append(Spacer(1, 10))

        # Executive summary
        story.append(Paragraph("<b>Mission Summary</b>", h2_style))
        story.append(Paragraph(score_report['summary_text'], body_style))
        story.append(Spacer(1, 10))

        # Scorecard Table
        cats = score_report["categories"]
        table_data = [
            ["Evaluation Category", "Score", "Maximum", "Percentage"],
            ["Scientific Achievement", f"{cats['scientific_achievement']['score']}", "25.0", f"{cats['scientific_achievement']['pct']}%"],
            ["Engineering Design & Margins", f"{cats['engineering_design']['score']}", "20.0", f"{cats['engineering_design']['pct']}%"],
            ["Resource & Budget Efficiency", f"{cats['resource_efficiency']['score']}", "15.0", f"{cats['resource_efficiency']['pct']}%"],
            ["Spacecraft Health & Reliability", f"{cats['spacecraft_health']['score']}", "15.0", f"{cats['spacecraft_health']['pct']}%"],
            ["Communication & Data Delivery", f"{cats['communication_data']['score']}", "15.0", f"{cats['communication_data']['pct']}%"],
            ["Mission Operations & Decisions", f"{cats['mission_operations']['score']}", "10.0", f"{cats['mission_operations']['pct']}%"],
            ["FINAL TOTAL SCORE", f"{score_report['total_score']}", "100.0", f"{score_report['total_score']}%"]
        ]
        t = Table(table_data, colWidths=[240, 80, 80, 80])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ]))
        story.append(t)
        story.append(Spacer(1, 14))

        # Lessons learned
        story.append(Paragraph("<b>Systems Engineering Lessons Learned</b>", h2_style))
        for l in score_report.get("lessons_learned", []):
            story.append(Paragraph(f"• {l}", body_style))
        story.append(Spacer(1, 10))

        # Recommendations
        story.append(Paragraph("<b>Recommendations for Next Mission</b>", h2_style))
        for s in score_report.get("suggestions", []):
            story.append(Paragraph(f"• {s}", body_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        # Fallback to simple bytes text
        return f"PDF generation fallback: {str(e)}".encode('utf-8')

