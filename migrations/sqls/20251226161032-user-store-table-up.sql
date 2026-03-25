CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    username varchar(100),
    Password varchar(255),
    Email varchar(255),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FK_Role INT REFERENCES Roles(role_id)
);