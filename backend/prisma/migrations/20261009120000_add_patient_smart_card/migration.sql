ALTER TABLE "Patient"
ADD COLUMN "smartCardId" TEXT,
ADD COLUMN "allergies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "emergencyContactName" TEXT,
ADD COLUMN "emergencyContactPhone" TEXT;

WITH numbered_patients AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "id") AS row_number
    FROM "Patient"
)
UPDATE "Patient" AS patient
SET "smartCardId" = 'SCN-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(numbered_patients.row_number::TEXT, 6, '0')
FROM numbered_patients
WHERE patient."id" = numbered_patients."id";

ALTER TABLE "Patient"
ALTER COLUMN "smartCardId" SET NOT NULL;

CREATE UNIQUE INDEX "Patient_smartCardId_key" ON "Patient"("smartCardId");