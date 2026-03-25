CREATE TABLE OrderProducts (
    orderItemId SERIAL PRIMARY KEY,
    productId INT NOT NULL,
    userId INT NOT NULL,
    quantity INT NOT NULL,
    price decimal(10, 2) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES Orders(orderId),
    FOREIGN KEY (productId) REFERENCES Products(productId),
);