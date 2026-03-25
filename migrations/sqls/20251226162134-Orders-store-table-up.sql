CREATE TYPE OrdersStatus AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');

CREATE TABLE Orders (
    orderId SERIAL PRIMARY KEY,
    orderDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status OrdersStatus NOT NULL,
    totalAmount decimal(10, 2) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fk_userId INT,
    CONSTRAINT fk_user
        FOREIGN KEY(fk_userId)
            REFERENCES Users(userId)
);