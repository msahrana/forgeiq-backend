-- AlterEnum
ALTER TYPE "PaymentGateway" ADD VALUE 'BKASH';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "gateway" SET DEFAULT 'STRIPE';
