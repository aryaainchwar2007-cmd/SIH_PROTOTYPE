from typing import Optional
from fastapi import APIRouter, Response, Query

from backend.app.services.report_service import report_service
from backend.app.models.schemas import ReportExportRequest, ReportExportResponse

router = APIRouter(prefix="/reports", tags=["Governance Dossiers & Reports"])


@router.post(
    "/export-dossier",
    response_model=ReportExportResponse,
    summary="Generate statutory relocation action brief",
)
def export_dossier(payload: ReportExportRequest):
    """Generates official metadata and sanction brief for resettlement under Section 38
    of the Disaster Management Act.
    """
    metadata = report_service.generate_dossier_metadata(
        habitation_id=payload.habitation_id,
        template_id=payload.report_template_id,
    )
    return metadata


@router.get(
    "/download",
    summary="Download formal statutory relocation dossier PDF",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Binary PDF document stream for direct download or preview.",
        }
    },
)
def download_dossier_pdf(
    habitation_id: Optional[str] = Query("HAB_001", description="Target habitation identifier"),
):
    """Generates and returns an official PDF binary document with structured multi-hazard
    demographics, AHP suitability matrix, and CPHEEO carrying capacity audit.
    """
    pdf_bytes = report_service.generate_dossier_pdf(habitation_id=habitation_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="relocation_dossier_{habitation_id}.pdf"'
        },
    )
