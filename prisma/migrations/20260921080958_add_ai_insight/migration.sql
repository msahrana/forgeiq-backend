-- CreateEnum
CREATE TYPE "AIInsightType" AS ENUM ('MACHINE_FAILURE', 'PRODUCTION_DROP', 'ENERGY_SPIKE', 'QUALITY_ISSUE', 'MAINTENANCE_DUE', 'EFFICIENCY_DROP', 'GENERAL');

-- CreateEnum
CREATE TYPE "AIInsightSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plantId" TEXT,
    "type" "AIInsightType" NOT NULL,
    "severity" "AIInsightSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT,
    "metadata" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInsight_organizationId_idx" ON "AIInsight"("organizationId");

-- CreateIndex
CREATE INDEX "AIInsight_plantId_idx" ON "AIInsight"("plantId");

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");

-- CreateIndex
CREATE INDEX "AIInsight_severity_idx" ON "AIInsight"("severity");

-- CreateIndex
CREATE INDEX "AIInsight_isResolved_idx" ON "AIInsight"("isResolved");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
