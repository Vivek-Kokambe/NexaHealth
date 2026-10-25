CREATE TYPE "PatientLookupMethod" AS ENUM ('RFID', 'QR', 'MANUAL');

CREATE TABLE "PatientInfoAccessLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "accessedByUserId" TEXT NOT NULL,
    "method" "PatientLookupMethod" NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientInfoAccessLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientInfoAccessLog_patientId_accessedAt_idx"
ON "PatientInfoAccessLog"("patientId", "accessedAt");

CREATE INDEX "PatientInfoAccessLog_accessedByUserId_accessedAt_idx"
ON "PatientInfoAccessLog"("accessedByUserId", "accessedAt");

ALTER TABLE "PatientInfoAccessLog"
ADD CONSTRAINT "PatientInfoAccessLog_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientInfoAccessLog"
ADD CONSTRAINT "PatientInfoAccessLog_accessedByUserId_fkey"
FOREIGN KEY ("accessedByUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
