ALTER TABLE "Patient"
ADD COLUMN "rfidUid" TEXT,
ADD COLUMN "rfidPairingExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Patient_rfidUid_key" ON "Patient"("rfidUid");

CREATE TYPE "RfidScanType" AS ENUM ('ATTACHED', 'DETECTED');

CREATE TABLE "RfidScanEvent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "RfidScanType" NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RfidScanEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RfidScanEvent_patientId_scannedAt_idx" ON "RfidScanEvent"("patientId", "scannedAt");

ALTER TABLE "RfidScanEvent"
ADD CONSTRAINT "RfidScanEvent_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;