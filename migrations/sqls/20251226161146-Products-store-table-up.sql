CREATE TABLE Products (
    productId SERIAL PRIMARY KEY,
    productName varchar(255) NOT NULL,
    description text,
    price decimal(10, 2) NOT NULL,
    quantity int NOT NULL,
    imgUrl text,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fk_category INT REFERENCES Category(categoryId)
);