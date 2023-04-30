import express, { Express, Request, Response } from 'express';
import { matchedData, query, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const prisma = new PrismaClient();

app.get('/', (req: Request, res: Response) => {
	res.send('Express + TypeScript Server');
});

app.get('/restaurants', async (req: Request, res: Response) => {
	const restaurants = await prisma.restaurant.findMany({
		select: {
			id: true,
			restaurantName: true,
			cashBalance: true,
			openingHours: {
				select: {
					startDayOfWeek: true,
					startTimeHours: true,
					startTimeMinutes: true,
					endDayOfWeek: true,
					endTimeHours: true,
					endTimeMinutes: true,
				},
			},
			dishes: {
				select: {
					id: true,
					dishName: true,
					price: true,
				},
			},
		},
	});
	const data = JSON.stringify(restaurants, (key, value) =>
		typeof value === 'bigint' ? Number(value) / 100 : value
	);
	res.send(data);
});

app.get(
	'/restaurants/date',
	query('datetime').notEmpty().escape(),
	async (req: Request, res: Response) => {
		const result = validationResult(req);

		if (result.isEmpty()) {
			const queryData = matchedData(req);

			const openingHours = await prisma.restaurant.findMany({
				where: {
					AND: [
						{
							openingHours: {
								some: {
									startDayOfWeek: {
										lte: new Date(queryData.datetime).getDay(),
									},
									startTimeHours: {
										lte: new Date(queryData.datetime).getUTCHours(),
									},
									startTimeMinutes: {
										lte: new Date(queryData.datetime).getMinutes(),
									},
									endDayOfWeek: {
										gte: new Date(queryData.datetime).getDay(),
									},
									endTimeHours: {
										gte: new Date(queryData.datetime).getUTCHours(),
									},
									endTimeMinutes: {
										gte: new Date(queryData.datetime).getMinutes(),
									},
								},
							},
						},
					],
				},
				include: {
					openingHours: true,
				},
			});

			const data = JSON.stringify(openingHours, (key, value) =>
				typeof value === 'bigint' ? Number(value) / 100 : value
			);
			res.send(data);
		} else {
			res.send({ errors: result.array() });
		}
	}
);

async function findRestaurants({
	priceRangeMin,
	priceRangeMax,
	restaurantLimit,
	dishesCount,
	isMore,
}: {
	priceRangeMin: number;
	priceRangeMax: number;
	restaurantLimit: number;
	dishesCount: number;
	isMore: boolean;
}) {
	// get the count of dishes within the range
	let restaurantWithDishesInPriceRange = await prisma.restaurantDish.groupBy({
		by: ['restaurantId'],
		where: {
			price: { gte: priceRangeMin, lte: priceRangeMax },
		},
		_count: {
			dishName: true,
		},
	});

	// get the valid counts
	let validRestaurant: number[] = [];

	restaurantWithDishesInPriceRange.forEach((restaurant) => {
		if (isMore && restaurant._count.dishName > dishesCount) {
			validRestaurant.push(restaurant.restaurantId);
		} else if (!isMore && restaurant._count.dishName < dishesCount) {
			validRestaurant.push(restaurant.restaurantId);
		}
	});

	// order and find those restaurant in those ID
	let restaurants = await prisma.restaurant.findMany({
		take: restaurantLimit,
		select: {
			id: false,
			restaurantName: true,
			dishes: {
				select: {
					id: false,
					dishName: true,
					price: true,
				},
			},
		},
		orderBy: { restaurantName: 'asc' },
		where: {
			id: {
				in: validRestaurant,
			},
		},
	});

	return restaurants;
}

app.get('/restaurants/top', async (req: Request, res: Response) => {
	const priceRangeMin =
		req.query.priceRangeMin !== undefined
			? Math.floor(Number(req.query.priceRangeMin) * 100)
			: 0;
	const priceRangeMax =
		req.query.priceRangeMax !== undefined
			? Math.floor(Number(req.query.priceRangeMax) * 100)
			: 300;

	const restaurantLimit =
		req.query.restaurantLimit !== undefined ? Number(req.query.restaurantLimit) : 10;
	const dishesCount = req.query.dishesCount !== undefined ? Number(req.query.dishesCount) : 10;

	const isMore = req.query.isMore !== undefined ? req.query.isMore.toString() === '1' : false;

	const restaurants = await findRestaurants({
		priceRangeMin: priceRangeMin,
		priceRangeMax: priceRangeMax,
		restaurantLimit: restaurantLimit,
		dishesCount: Number(dishesCount),
		isMore: isMore,
	});
	const data = JSON.stringify(restaurants, (key, value) =>
		typeof value === 'bigint' ? Number(value) / 100 : value
	);
	res.send(data);
});

app.get('/restaurants/search', async (req: Request, res: Response) => {
	// restaurant name
	// dishes name
	if (req.query.restaurantName !== undefined && req.query.dishesName !== undefined) {
		res.send({ error: 'input only one search term' });
		return;
	}

	if (req.query.restaurantName !== undefined) {
		const restaurantName = req.query.restaurantName.toString();

		const searchedRestaurants = await prisma.restaurant.findMany({
			select: {
				restaurantName: true,
				openingHours: {
					select: {
						startDayOfWeek: true,
						startTimeHours: true,
						startTimeMinutes: true,
						endDayOfWeek: true,
						endTimeHours: true,
						endTimeMinutes: true,
					},
				},
				dishes: {
					select: {
						dishName: true,
						price: true,
					},
				},
			},
			where: {
				restaurantName: {
					search: restaurantName,
				},
			},
		});

		const data = JSON.stringify(searchedRestaurants, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);

		res.send(data);
		return;
	}

	if (req.query.dishName !== undefined) {
		const dishName = req.query.dishName !== undefined ? req.query.dishName.toString() : '';

		const searchedDishes = await prisma.restaurantDish.findMany({
			select: {
				dishName: true,
				price: true,
				restaurant: {
					select: {
						restaurantName: true,
						openingHours: {
							select: {
								startDayOfWeek: true,
								startTimeHours: true,
								startTimeMinutes: true,
								endDayOfWeek: true,
								endTimeHours: true,
								endTimeMinutes: true,
							},
						},
						dishes: {
							select: {
								dishName: true,
								price: true,
							},
						},
					},
				},
			},
			where: {
				dishName: {
					search: dishName,
				},
			},
		});

		const data = JSON.stringify(searchedDishes, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);

		res.send(data);
		return;
	}

	// TODO: fix the errors
	res.send({ error: 'invalid query params' });
});

app.get('/customers', query('id').notEmpty().escape(), async (req: Request, res: Response) => {
	const result = validationResult(req);

	if (result.isEmpty()) {
		const customers = await prisma.customer.findMany({
			where: {
				id: Number(req.query.id),
			},
			include: {
				purchaseHistory: true,
			},
		});
		const data = JSON.stringify(customers, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		res.send(data);
	} else {
		const customers = await prisma.customer.findMany({
			include: {
				purchaseHistory: true,
			},
		});
		const data = JSON.stringify(customers, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		res.send(data);
	}
});

app.get('/customers/pay', async (req: Request, res: Response) => {
	// id, dish_id

	const customer = await prisma.customer.findFirstOrThrow({
		where: {
			id: Number(req.query.customerId),
		},
	});

	const dish = await prisma.restaurantDish.findFirstOrThrow({
		where: {
			id: Number(req.query.dishId),
		},
	});

	const restaurant = await prisma.restaurant.findFirstOrThrow({
		where: {
			id: Number(dish.restaurantId),
		},
	});

	if (customer.cashBalance < dish.price) {
		res.statusCode = 402;
		res.send('Insufficient cash balance');
		return;
	}
	try {
		const updatedCustomer = await prisma.customer.update({
			where: {
				id: Number(req.query.customerId),
			},
			data: {
				cashBalance: customer.cashBalance - dish.price,
				purchaseHistory: {
					create: {
						dishName: dish.dishName,
						restaurantName: restaurant.restaurantName,
						transactionAmount: dish.price,
					},
				},
			},
		});
		const data = JSON.stringify(updatedCustomer, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error updating customer data' });
	}
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
