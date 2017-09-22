IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
  DROP TABLE dbo.Users

IF OBJECT_ID('dbo.Rooms', 'U') IS NOT NULL
  DROP TABLE dbo.Rooms

CREATE TABLE Rooms
(
  RoomID uniqueidentifier NOT NULL PRIMARY KEY DEFAULT newid(),
  RoomName nvarchar(25) NOT NULL,
  Password nvarchar(128) NULL,
  CreationDate datetime NOT NULL DEFAULT GETDATE(),
  IsActive BIT NOT NULL
);

CREATE TABLE Users
(
  UserID uniqueidentifier NOT NULL PRIMARY KEY DEFAULT newid(),
  UserName nvarchar(25) NOT NULL UNIQUE,
  CurrentRoom uniqueidentifier FOREIGN KEY REFERENCES Rooms(RoomID),
  IsHost BIT NOT NULL DEFAULT 0
);
