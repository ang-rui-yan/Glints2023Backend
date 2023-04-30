# Glints 2023 Backend (Software Engineering Internship application)

## Introduction

## Setup

-   Set up PostgresSQL
-   Create .env with the following

```
PORT=8000
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_table>?schema=public"
```

-   Run src/etl/load.ts to insert data into the database

```
yarn devStart
```

-   Start the server

```
yarn dev
```

## API endpoints

| HTTP Verbs | Endpoints           | Action                                                                                  |
| ---------- | ------------------- | --------------------------------------------------------------------------------------- |
| GET        | /                   | -                                                                                       |
| GET        | /restaurants        | Displays every restaurants                                                              |
| GET        | /restaurants/date   | Get restaurants that open given a date                                                  |
| GET        | /restaurants/top    | Get top y restaurants with more or less x number of dishes within the given price range |
| GET        | /restaurants/search | Search either restaurant name or dish name                                              |
| GET        | /customers          | Search for a customer given an id                                                       |
| GET        | /customers/pay      | Perform a transaction given a customer id and a dish id                                 |

### Query pararms for /restaurants

No query string required

### Query pararms for /restaurants/date

| Query String | Description                                | Mandatory? | Example                  |
| ------------ | ------------------------------------------ | ---------- | ------------------------ |
| datetime     | Retrieves restaurants within opening hours | Y          | 2023-04-29T11:31:00.000Z |

### Query pararms for /restaurants/top

| Query String    | Description                                                                     | Mandatory? | Example |
| --------------- | ------------------------------------------------------------------------------- | ---------- | ------- |
| priceRangeMin   | Prices of dishes more than the minimum                                          | Y          | 11.00   |
| priceRangeMax   | Prices of dishes less than the minimum                                          | Y          | 12.00   |
| restaurantLimit | Limit to the top y restaurants in ascending order                               | Y          | 2       |
| isMore          | Either retrieves restaurants with count of dishes more or less than dishesCount | Y          | 1       |
| dishesCount     | Retrieves restaurants where x number of dishes meet the price range             | Y          | 2       |

### Query pararms for /restaurants/search

| Query String   | Description                          | Either OR | Example |
| -------------- | ------------------------------------ | --------- | ------- |
| restaurantName | Get restaurants with the search term | Y / N     | bistro  |
| dishName       | Get dishes with the search term      | N / Y     | 12.00   |

### Query pararms for /customers

| Query String | Description                             | Mandatory? | Example |
| ------------ | --------------------------------------- | ---------- | ------- |
| id           | Get customers with the corresponding id | Y          | 2       |

### Query pararms for /customers/pay

| Query String | Description                   | Mandatory? | Example |
| ------------ | ----------------------------- | ---------- | ------- |
| customerId   | Payee                         | Y          | 2       |
| dishId       | Dish id that is paid by payee | Y          | 2627267 |
