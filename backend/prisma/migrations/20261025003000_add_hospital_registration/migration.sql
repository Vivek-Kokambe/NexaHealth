ALTER TYPE "UserRole" ADD VALUE 'HOSPITAL';

ALTER TABLE "Hospital"
ADD COLUMN "userId" TEXT,
ADD COLUMN "hospitalType" TEXT,
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "totalBeds" INTEGER,
ADD COLUMN "icuBeds" INTEGER,
ADD COLUMN "operatingHours" TEXT,
ADD COLUMN "facilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "Hospital_userId_key" ON "Hospital"("userId");

ALTER TABLE "Hospital"
ADD CONSTRAINT "Hospital_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
