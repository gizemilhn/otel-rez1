-- Create view for user reservations
CREATE OR REPLACE VIEW "UserReservationView" AS
SELECT 
  r.id,
  r."userId",
  CONCAT(u."firstName", ' ', u."lastName") as "userName",
  u.email as "userEmail",
  u."tcNumber" as "userTcNumber",
  u."birthDate" as "userBirthDate",
  r."roomId",
  rm.number as "roomNumber",
  rm.type as "roomType",
  rm.price as "roomPrice",
  h.id as "hotelId",
  h.name as "hotelName",
  h.city as "hotelCity",
  r."checkIn",
  r."checkOut",
  r.status,
  r."totalPrice",
  r."guestCount",
  r."createdAt"
FROM "Reservation" r
JOIN "User" u ON r."userId" = u.id
JOIN "Room" rm ON r."roomId" = rm.id
JOIN "Hotel" h ON rm."hotelId" = h.id;

-- Create function for room status update trigger
CREATE OR REPLACE FUNCTION log_room_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO "RoomStatusLog" ("roomId", "oldStatus", "newStatus", "reason", "userId")
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      CASE 
        WHEN NEW.status = 'OCCUPIED' THEN 'RESERVATION_CREATED'
        WHEN NEW.status = 'AVAILABLE' THEN 'RESERVATION_CANCELLED'
        ELSE 'MANUAL_UPDATE'
      END,
      COALESCE(current_setting('app.current_user_id', true), 'system')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room status changes
CREATE TRIGGER room_status_change_trigger
AFTER UPDATE ON "Room"
FOR EACH ROW
EXECUTE FUNCTION log_room_status_change(); 