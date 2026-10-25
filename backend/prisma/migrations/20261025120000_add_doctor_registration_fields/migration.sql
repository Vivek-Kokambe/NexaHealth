ALTER TABLE "Doctor"
  ADD COLUMN "qualifications" TEXT,
  ADD COLUMN "consultationFee" INTEGER,
  ADD COLUMN "clinicalExperience" INTEGER,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "affiliationCode" TEXT,
  ADD COLUMN "credentialDocument" TEXT;

ALTER TABLE "Doctor"
  ALTER COLUMN "hospitalId" DROP NOT NULL,
  ALTER COLUMN "departmentId" DROP NOT NULL;