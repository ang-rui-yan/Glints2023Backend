import express, { Express, Request, Response } from 'express';
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

app.get('/restaurants/date/:datetime', async (req: Request, res: Response) => {
	const { datetime } = req.params;

	try {
		const openingHours = await prisma.restaurant.findMany({
			where: {
				AND: [
					{
						openingHours: {
							some: {
								startDayOfWeek: {
									lte: new Date(datetime).getDay(),
								},
								startTimeHours: {
									lte: new Date(datetime).getUTCHours(),
								},
								startTimeMinutes: {
									lte: new Date(datetime).getMinutes(),
								},
								endDayOfWeek: {
									gte: new Date(datetime).getDay(),
								},
								endTimeHours: {
									gte: new Date(datetime).getUTCHours(),
								},
								endTimeMinutes: {
									gte: new Date(datetime).getMinutes(),
								},
							},
						},
					},
				],
			},
		});

		const data = JSON.stringify(openingHours, (key, value) =>
			typeof value === 'bigint' ? Number(value) / 100 : value
		);
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send('Error listing restaurants');
	}
});

app.get('/restaurants/top', (req: Request, res: Response) => {
	res.send('restaurant top');
});

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

app.get('/restaurants/search', async (req: Request, res: Response) => {
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

app.get('/user/transactions', (req: Request, res: Response) => {
	res.send('restaurant transactions');
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
