-- Create hotel summary view
CREATE OR REPLACE VIEW "HotelSummary" AS
SELECT 
  h.id,
  h.name,
  h.city,
  h.country,
  h.rating,
  CONCAT(u.firstName, ' ', u.lastName) as "managerName",
  COUNT(r.id) as "roomCount",
  COUNT(r.id) FILTER (WHERE r.status = 'AVAILABLE') as "availableRooms",
  COUNT(r.id) as "totalRooms"
FROM "Hotel" h
LEFT JOIN "User" u ON h."managerId" = u.id
LEFT JOIN "Room" r ON h.id = r."hotelId"
GROUP BY h.id, h.name, h.city, h.country, h.rating, u.firstName, u.lastName;

-- Create reservation log table
CREATE TABLE IF NOT EXISTS "ReservationLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reservationId" UUID NOT NULL,
  action VARCHAR(10) NOT NULL,
  "oldStatus" VARCHAR(20),
  "newStatus" VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "userId" UUID NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ReservationLog_reservationId_idx" ON "ReservationLog"("reservationId");
CREATE INDEX IF NOT EXISTS "ReservationLog_timestamp_idx" ON "ReservationLog"(timestamp);

-- Create trigger function
CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO "ReservationLog" ("reservationId", action, "newStatus", "userId")
    VALUES (NEW.id, 'INSERT', NEW.status, NEW."userId");
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status <> NEW.status THEN
      INSERT INTO "ReservationLog" ("reservationId", action, "oldStatus", "newStatus", "userId")
      VALUES (NEW.id, 'UPDATE', OLD.status, NEW.status, NEW."userId");
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO "ReservationLog" ("reservationId", action, "oldStatus", "userId")
    VALUES (OLD.id, 'DELETE', OLD.status, OLD."userId");
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS reservation_log_trigger ON "Reservation";
CREATE TRIGGER reservation_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Reservation"
FOR EACH ROW EXECUTE FUNCTION log_reservation_changes(); 