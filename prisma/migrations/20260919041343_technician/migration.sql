-- CreateEnum
CREATE TYPE "TechnicianStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "TechnicianType" AS ENUM ('ELECTRICAL', 'MECHANICAL', 'HVAC', 'AUTOMATION', 'INSTRUMENTATION', 'CNC', 'WELDING', 'GENERAL');

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plantId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "specialization" "TechnicianType" NOT NULL,
    "status" "TechnicianStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "emergencyPhone" TEXT,
    "joiningDate" TIMESTAMP(3),
    "experience" INTEGER,
    "qualification" TEXT,
    "certification" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userId_key" ON "Technician"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_employeeCode_key" ON "Technician"("employeeCode");

-- CreateIndex
CREATE INDEX "Technician_organizationId_idx" ON "Technician"("organizationId");

-- CreateIndex
CREATE INDEX "Technician_plantId_idx" ON "Technician"("plantId");

-- CreateIndex
CREATE INDEX "Technician_status_idx" ON "Technician"("status");

-- CreateIndex
CREATE INDEX "Technician_specialization_idx" ON "Technician"("specialization");

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
