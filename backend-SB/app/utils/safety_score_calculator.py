from datetime import date

from app.enums.complaint_status import ComplaintStatus
from app.enums.certificate_status import CertificateStatus


class SafetyScoreCalculator:

    def calculate(
        self,
        inspections,
        complaints,
        certificates,
    ):

        # ==========================================
        # Inspection (60%)
        # ==========================================

        inspection_weight = 0
        inspection_age_penalty = 0

        if inspections:

            latest = max(
                inspections,
                key=lambda inspection: inspection.inspection_date,
            )

            inspection_weight = (
                float(latest.score) / 100
            ) * 60

            days = (
                date.today()
                - latest.inspection_date
            ).days

            if days > 365:

                inspection_age_penalty = 10

            elif days > 180:

                inspection_age_penalty = 7

            elif days > 90:

                inspection_age_penalty = 3

        # ==========================================
        # Complaints (20%)
        # ==========================================

        pending = 0
        under_investigation = 0

        for complaint in complaints:

            if complaint.status == ComplaintStatus.PENDING:

                pending += 1

            elif complaint.status == ComplaintStatus.UNDER_INVESTIGATION:

                under_investigation += 1

        penalty = (
            pending * 5
            + under_investigation * 2
        )

        complaint_weight = max(
            0,
            20 - penalty,
        )

        # ==========================================
        # Certificates (20%)
        # ==========================================

        verified = 0
        expired = 0

        for certificate in certificates:

            if certificate.status == CertificateStatus.VERIFIED:

                if certificate.expiry_date >= date.today():

                    verified += 1

                else:

                    expired += 1

        if verified == 0:

            certificate_weight = 0

        else:

            certificate_weight = 20

            certificate_weight -= min(
                expired * 5,
                15,
            )

        # ==========================================
        # Final Score
        # ==========================================

        final_score = (
            inspection_weight
            + complaint_weight
            + certificate_weight
            - inspection_age_penalty
        )

        final_score = max(
            0,
            min(
                100,
                final_score,
            ),
        )

        return {
            "final_score": round(final_score, 2),
            "inspection_weight": round(
                inspection_weight,
                2,
            ),
            "complaint_weight": complaint_weight,
            "certificate_weight": certificate_weight,
            "inspection_age_penalty": inspection_age_penalty,
        }