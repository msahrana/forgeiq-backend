-- CreateIndex
CREATE INDEX "Report_dateFrom_dateTo_idx" ON "Report"("dateFrom", "dateTo");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
