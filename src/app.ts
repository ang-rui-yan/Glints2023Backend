import express, { Express, Request, Response } from 'express';
import { matchedData, query, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { checkBothNumericQuery, checkXORQuery } from './middleware/middleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const prisma = new PrismaClient();
app.get('/', async (req: Request, res: Response) => {
	res.send('Hello world');
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
	return res.json(JSON.parse(data));
});

app.get(
	'/restaurants/date',
	query('datetime').notEmpty().escape(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
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
		return res.json(JSON.parse(data));
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
					id: true,
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

app.get(
	'/restaurants/top',
	query(['priceRangeMin', 'priceRangeMax', 'restaurantLimit', 'dishesCount', 'isMore'])
		.notEmpty()
		.escape(),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const restaurants = await findRestaurants({
			priceRangeMin: Math.floor(Number(req.query.priceRangeMin) * 100),
			priceRangeMax: Math.floor(Number(req.query.priceRangeMax) * 100),
			restaurantLimit: Number(req.query.restaurantLimit),
			dishesCount: Number(req.query.dishesCount),
			isMore: req.query.isMore?.toString() === '1',
		});

		const data = JSON.stringify(restaurants, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		return res.json(JSON.parse(data));
	}
);

app.get(
	'/restaurants/search',
	checkXORQuery('restaurantName', 'dishName'),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
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
							id: true,
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

			return res.json(JSON.parse(data));
		} else if (req.query.dishName !== undefined) {
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

			return res.json(JSON.parse(data));
		}
	}
);

app.get('/customers', query('id').notEmpty().escape(), async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const customers = await prisma.customer.findMany({
			include: {
				purchaseHistory: true,
			},
		});
		const data = JSON.stringify(customers, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		return res.json(JSON.parse(data));
	}

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
	return res.json(JSON.parse(data));
});

app.get(
	'/customers/pay',
	checkBothNumericQuery('customerId', 'dishId'),
	async (req: Request, res: Response) => {
		// id, dish_id
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
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
				res.status(500).json({ message: 'Error updating customer data' });
			}
		} catch (e) {
			res.status(404).json(e + '');
		}
	}
);

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
