-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'cash_on_arrival',
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "receivedAt" TIMESTAMP(3);
