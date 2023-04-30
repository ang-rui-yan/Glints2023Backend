export interface RestaurantData {
	restaurantName: string;
	cashBalance: number;
	menu: {
		dishName: string;
		price: number;
	}[];
	openingHours: string;
}

export interface RestaurantOpeningHour {
	startDayOfWeek: number;
	startTimeHours: number;
	startTimeMinutes: number;
	endDayOfWeek: number;
	endTimeHours: number;
	endTimeMinutes: number;
}

export interface Customer {
	id: number;
	firstName: string;
	lastName: string;
	cashBalance: number;
	purchaseHistory: CustomerPurchaseHistory[];
}

export interface CustomerPurchaseHistory {
	dishName: string;
	restaurantName: string;
	transactionDate: Date;
	transactionAmount: number;
}
