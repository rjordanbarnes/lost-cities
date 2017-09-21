CREATE TABLE Users
(
  UserID uniqueidentifier NOT NULL DEFAULT newid(),
  Name nvarchar(25) NOT NULL UNIQUE
);

CREATE TABLE Rooms
(
  RoomID uniqueidentifier NOT NULL DEFAULT newid(),
  Name nvarchar(25) NOT NULL,
  Password nvarchar(128) NULL
);