-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "cashBalance" BIGINT NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantOpeningHour" (
    "id" SERIAL NOT NULL,
    "startDayOfWeek" INTEGER NOT NULL,
    "startTime" TIME NOT NULL,
    "endDayOfWeek" INTEGER NOT NULL,
    "endTime" TIME NOT NULL,
    "restaurantId" INTEGER NOT NULL,

    CONSTRAINT "RestaurantOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantDish" (
    "id" SERIAL NOT NULL,
    "dishName" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "restaurantId" INTEGER NOT NULL,

    CONSTRAINT "RestaurantDish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cashBalance" BIGINT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPurchaseHistory" (
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "dishId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "CustomerPurchaseHistory_pkey" PRIMARY KEY ("transactionDate","dishId","customerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_restaurantName_key" ON "Restaurant"("restaurantName");

-- AddForeignKey
ALTER TABLE "RestaurantOpeningHour" ADD CONSTRAINT "RestaurantOpeningHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDish" ADD CONSTRAINT "RestaurantDish_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPurchaseHistory" ADD CONSTRAINT "CustomerPurchaseHistory_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "RestaurantDish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPurchaseHistory" ADD CONSTRAINT "CustomerPurchaseHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
