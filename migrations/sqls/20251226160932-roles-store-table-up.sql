CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role varchar(50) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO Roles (role) VALUES 
('Admin'),
('Manager'),
('Employee'),
('Customer');