-- Create HotelSummary view
CREATE OR REPLACE VIEW "HotelSummary" AS
SELECT 
    h.id,
    h.name,
    h.city,
    h.country,
    h.rating,
    CONCAT(u.firstName, ' ', u.lastName) as "managerName",
    COUNT(r.id) as "roomCount",
    COUNT(r.id) as "totalRooms",
    COUNT(CASE WHEN r.status = 'AVAILABLE' THEN 1 END) as "availableRooms"
FROM "Hotel" h
LEFT JOIN "User" u ON h.managerId = u.id
LEFT JOIN "Room" r ON h.id = r.hotelId
GROUP BY h.id, h.name, h.city, h.country, h.rating, u.firstName, u.lastName;

-- Create UserReservationView view
CREATE OR REPLACE VIEW "UserReservationView" AS
SELECT 
    r.id,
    r.userId,
    CONCAT(u.firstName, ' ', u.lastName) as "userName",
    u.email as "userEmail",
    u.tcNumber as "userTcNumber",
    u.birthDate as "userBirthDate",
    r.roomId,
    rm.number as "roomNumber",
    rm.type as "roomType",
    rm.price as "roomPrice",
    h.id as "hotelId",
    h.name as "hotelName",
    h.city as "hotelCity",
    r.checkIn,
    r.checkOut,
    r.status,
    r.totalPrice,
    r.guestCount,
    r.createdAt
FROM "Reservation" r
JOIN "User" u ON r.userId = u.id
JOIN "Room" rm ON r.roomId = rm.id
JOIN "Hotel" h ON rm.hotelId = h.id; 