// export interface Restaurant {
// 	restaurantName: string;
// 	cashBalance: number;
// 	openingHours: RestaurantOpeningHour[];
// 	menu: RestaurantDish[];
// }

// export interface RestaurantOpeningHour {
// 	startDayOfWeek: number;
// 	startTime: Date;
// 	endDayOfWeek: number;
// 	endTime: Date;
// }

// export interface RestaurantDish {
// 	dishName: string;
// 	price: number;
// }

export interface RestaurantData {
	restaurantName: string;
	cashBalance: number;
	menu: {
		dishName: string;
		price: number;
	}[];
	openingHours: string;
}

export interface Restaurant {
	id: number;
	restaurantName: string;
	cashBalance: number;
	openingHours: RestaurantOpeningHour[];
	dishes: RestaurantDish[];
}

export interface RestaurantOpeningHour {
	startDayOfWeek: number;
	startTimeHours: number;
	startTimeMinutes: number;
	endDayOfWeek: number;
	endTimeHours: number;
	endTimeMinutes: number;
}

export interface RestaurantDish {
	dishName: string;
	price: bigint;
}

// export interface Customer {
// 	firstName: string;
// 	lastName: string;
// 	cashBalance: bigint;
// }

// export interface CustomerPurchaseHistory {
// 	transactionDate: Date;
// 	dishId: number;
// 	customerId: number;
// 	dish: RestaurantDish;
// 	customer: Customer;
// }
