-- DropForeignKey
ALTER TABLE "event_attendances" DROP CONSTRAINT "event_attendances_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_attendances" DROP CONSTRAINT "event_attendances_userId_fkey";

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
