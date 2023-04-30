import { PrismaClient } from '@prisma/client';
import { parseOpeningHours, getUserData } from './transform.ts';
import _rawRestaurantData from '../data/restaurant_with_menu.json';
import { RestaurantData, Customer, CustomerPurchaseHistory } from '../models/restaurant.model.ts';

const prisma = new PrismaClient();

async function insertRestaurant(data: RestaurantData[]) {
	await prisma.restaurantDish.deleteMany();
	await prisma.restaurantOpeningHour.deleteMany();
	await prisma.restaurant.deleteMany();
	for (const entry of data) {
		const { restaurantName, cashBalance, menu, openingHours } = entry;

		const openingHoursArray = parseOpeningHours(openingHours);
		await prisma.restaurant.create({
			data: {
				restaurantName,
				cashBalance: Math.floor(cashBalance * 100),
				dishes: {
					create: menu.map((dish) => ({
						dishName: dish.dishName,
						price: Math.floor(dish.price * 100),
					})),
				},
				openingHours: {
					create: openingHoursArray,
				},
			},
		});
	}
}

insertRestaurant(_rawRestaurantData)
	.catch((error) => {
		console.error(error);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function insertCustomer(data: Customer[]) {
	await prisma.customerPurchaseHistory.deleteMany();
	await prisma.customer.deleteMany();

	for (const entry of data) {
		const { id, firstName, lastName, cashBalance, purchaseHistory } = entry;

		await prisma.customer.create({
			data: {
				id: id,
				firstName: firstName,
				lastName: lastName,
				cashBalance: cashBalance,
				purchaseHistory: {
					create: purchaseHistory,
				},
			},
		});
	}
}

insertCustomer(getUserData())
	.catch((error) => {
		console.error(error);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
