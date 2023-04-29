CREATE TABLE IF NOT EXISTS restaurant (
	id SERIAL PRIMARY KEY,
	restaurantName VARCHAR(100) UNIQUE NOT NULL,
	cashBalance BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_opening_hour (
	id SERIAL PRIMARY KEY,
	openingDay INTEGER NOT NULL,
	startTime TIME NOT NULL,
	endTime TIME NOT NULL,
	restaurantId INTEGER NOT NULL,
	FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);

CREATE TABLE IF NOT EXISTS restaurant_dish (
	id SERIAL PRIMARY KEY,
	dishName TEXT NOT NULL,
	price BIGINT NOT NULL,
	restaurantId INTEGER NOT NULL,
	FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);

CREATE TABLE IF NOT EXISTS customer (
	id SERIAL PRIMARY KEY,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	cashBalance BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_purchase_history (
	transactionDate TIMESTAMP NOT NULL,
	dishId INTEGER NOT NULL,
	customerId INTEGER NOT NULL,
	PRIMARY KEY (transactionDate, dishId, customerId),
	FOREIGN KEY (dishId) REFERENCES restaurant_dish(id),
	FOREIGN KEY (customerId) REFERENCES customer(id)
);