/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Invoice` table. All the data in the column will be lost.
  - The `gateway` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `invoiceId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('SSLCOMMERZ', 'STRIPE', 'PAYPAL');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_paymentId_fkey";

-- DropIndex
DROP INDEX "Invoice_paymentId_idx";

-- DropIndex
DROP INDEX "Invoice_paymentId_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "paymentId";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "invoiceId" TEXT NOT NULL,
DROP COLUMN "gateway",
ADD COLUMN     "gateway" "PaymentGateway" NOT NULL DEFAULT 'SSLCOMMERZ';

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
