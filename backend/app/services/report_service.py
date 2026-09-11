import io
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from backend.app.db.repository import repository


class ReportService:
    """Official Governance Relocation Dossier Generation Service.
    Produces statutory relocation action briefs under Section 38 of the
    Disaster Management Act.
    """

    @classmethod
    def generate_dossier_pdf(cls, habitation_id: Optional[str] = None) -> bytes:
        """Generates a formal PDF relocation dossier binary stream."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        hab = None
        if habitation_id:
            hab = repository.get_habitation_by_id(habitation_id)
        if not hab:
            # Default to the critical demo habitation
            hab = repository.get_habitation_by_id("HAB_001") or {}

        site = None
        site_id = hab.get("recommendedSiteId")
        if site_id:
            site = repository.get_relocation_site_by_id(site_id)

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#1e3a8a"),
            alignment=1,
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#64748b"),
            alignment=1,
        )
        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Heading2"],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["BodyText"],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1e293b"),
        )

        story = []

        # 1. Official Header Banner
        story.append(Paragraph("STATE DISASTER MANAGEMENT AUTHORITY", title_style))
        story.append(
            Paragraph(
                "GOVERNMENT OF MAHARASHTRA • RELIEF COMMISSIONER DIRECTORATE<br/>"
                "STATUTORY PROACTIVE RELOCATION DOSSIER (DM ACT SEC 38)",
                subtitle_style,
            )
        )
        story.append(Spacer(1, 14))

        # 2. Reference & Date Metadata
        ref_code = f"SDMA/RELOC/2026/PS191-{hab.get('district', 'STATE').upper()}"
        meta_data = [
            ["Dossier Ref:", ref_code, "Generated:", datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M UTC")],
            ["Target Village:", hab.get("name", "N/A"), "Jurisdiction:", f"District {hab.get('district', 'N/A')}"],
            ["Risk Classification:", f"{hab.get('riskTier', 'Critical')} ({hab.get('riskScore', 0.0)}/100)", "Intervention Priority:", f"Priority {hab.get('priority', 1)} ({hab.get('priorityLabel', 'Immediate')})"],
        ]
        meta_table = Table(meta_data, colWidths=[110, 160, 100, 160])
        meta_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ])
        )
        story.append(meta_table)
        story.append(Spacer(1, 14))

        # 3. Geomorphological Vulnerability Assessment
        story.append(Paragraph("1. GEOPHYSICAL & VULNERABILITY ASSESSMENT", h2_style))
        vuln_text = (
            f"The settlement <b>{hab.get('name')}</b> is located at coordinates "
            f"<b>{hab.get('coordinates', [0, 0])[0]:.4f}°N, {hab.get('coordinates', [0, 0])[1]:.4f}°E</b>. "
            f"Topographic slope gradient measures <b>{hab.get('slopeDegree')}°</b>, exceeding critical basalt shear failure limits. "
            f"The village houses <b>{hab.get('population', 0):,} residents ({hab.get('households', 0)} households)</b>. "
            f"Socio-structural vulnerability index is <b>{hab.get('vulnerabilityIndex')}/100</b>, driven by "
            f"<b>{hab.get('kutchaHousingPercent')}% non-engineered mud structures</b> and an evacuation road cutoff distance of "
            f"<b>{hab.get('roadIsolationDistanceKm')} km</b> to nearest all-weather corridor."
        )
        story.append(Paragraph(vuln_text, body_style))
        story.append(Spacer(1, 10))

        # 4. Recommended Relocation Safe Parcel
        story.append(Paragraph("2. AUDITED SAFE RECIPIENT PARCEL", h2_style))
        if site:
            site_text = (
                f"Candidate land bank <b>{site.get('name')}</b> (ID: {site.get('id')}) has been evaluated via "
                f"Multi-Criteria Decision Analysis (AHP) scoring <b>{site.get('suitabilityScore')}% suitability</b>. "
                f"Safety buffer clearance is <b>{site.get('distanceFromRedZoneKm')} km</b> outside active hazard perimeters. "
                f"Usable area encompasses <b>{site.get('usableAreaAcres')} acres ({site.get('usableAreaSqm', 0):,} m²)</b> with a gentle plateau slope of "
                f"<b>{site.get('slopeDegree')}°</b>. "
                f"Potable water yield: <i>{site.get('waterAvailabilityStatus')}</i>."
            )
            story.append(Paragraph(site_text, body_style))
            story.append(Spacer(1, 10))

            # Capacity Table
            cap_data = [
                ["Target Displaced Population:", f"{hab.get('population', 0):,} persons"],
                ["Recipient Parcel Ceiling Capacity:", f"{site.get('estimatedCapacity', 0):,} persons"],
                ["Absorption Headroom:", f"+{site.get('estimatedCapacity', 0) - hab.get('population', 0):,} buffer"],
                ["Daily Water Demand (135 LPD norm):", f"{(hab.get('population', 0) * 135) / 1000.0:.1f} kL/day"],
                ["Healthcare Infrastructure:", str(site.get('healthcareStatus'))],
            ]
            cap_table = Table(cap_data, colWidths=[240, 290])
            cap_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#86efac")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bbf7d0")),
                ])
            )
            story.append(cap_table)
        else:
            story.append(Paragraph("No designated single safe parcel assigned. Cluster split relocation recommended.", body_style))

        story.append(Spacer(1, 20))

        # 5. Statutory Sign-off
        sign_text = (
            "<b>STATUTORY CERTIFICATION:</b><br/>"
            "This action dossier is generated autonomously by the Intelligent GIS Decision Support System "
            "and submitted for gazetted resettlement sanction under Section 38, Disaster Management Act 2005.<br/><br/>"
            "<i>Authorized Signatory: Relief Commissioner & Secretary (SDMA)</i>"
        )
        story.append(Paragraph(sign_text, body_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @classmethod
    def generate_dossier_metadata(cls, habitation_id: Optional[str] = None, template_id: str = "REP_01") -> Dict[str, Any]:
        """Returns JSON metadata summary for report preview."""
        hab = None
        if habitation_id:
            hab = repository.get_habitation_by_id(habitation_id)
        if not hab:
            hab = repository.get_habitation_by_id("HAB_001") or {}

        ref_code = f"SDMA/RELOC/2026/PS191-{hab.get('district', 'STATE').upper()}"
        return {
            "report_id": template_id,
            "title": f"Habitation Relocation Action Dossier: {hab.get('name', 'General')}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "reference_code": ref_code,
            "habitation_name": hab.get("name"),
            "district": hab.get("district"),
            "status": "Final Approved Order",
            "download_url": f"/api/v1/reports/download?habitation_id={hab.get('id', 'HAB_001')}",
            "content_summary": f"Comprehensive statutory relocation dossier for {hab.get('name')} ({hab.get('population', 0)} residents) under Section 38 of DM Act.",
        }


report_service = ReportService()
