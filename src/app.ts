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
	const restaurants = await prisma.restaurant.findMany();
	const data = JSON.stringify(restaurants, (key, value) =>
		typeof value === 'bigint' ? Number(value) / 100 : value
	);
	res.send(data);
});

app.get('/restaurants/:datetime', async (req: Request, res: Response) => {
	const { datetime } = req.params;
	console.log(new Date(datetime).getDay());
	console.log(new Date(datetime).getUTCHours());
	console.log(new Date(datetime).getUTCMinutes());
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

app.get('/restaurant/top', (req: Request, res: Response) => {
	res.send('restaurant top');
});

app.get('/restaurant/search', (req: Request, res: Response) => {
	res.send('restaurant search');
});

app.get('/user/transactions', (req: Request, res: Response) => {
	res.send('restaurant transactions');
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
