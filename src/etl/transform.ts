import _rawRestaurantData from '../data/restaurant_with_menu.json';
import _rawUserData from '../data/users_with_purchase_history.json';
import {
	RestaurantOpeningHour,
	Customer,
	CustomerPurchaseHistory,
} from '../models/restaurant.model';

/* handle opening hours of restaurant */

function getTime(inputString: string): [Date, Date] | null {
	const match = inputString.match(/\d/);
	if (match) {
		const startIndex = inputString.indexOf(match[0]);
		const result = inputString.slice(startIndex);
		const [start, end] = result.split(' - ');

		let [hours, meridiem] = start.split(' ');
		let [hour, minute] = hours.split(':');
		let formattedTime = `${hour.padStart(2, '0')}:${minute ? minute : '00'} ${meridiem}`;
		const startDate = new Date(`01/01/2000 ${formattedTime}`);

		[hours, meridiem] = end.split(' ');
		[hour, minute] = hours.split(':');
		formattedTime = `${hour.padStart(2, '0')}:${minute ? minute : '00'} ${meridiem}`;
		const endDate = new Date(`01/01/2000 ${formattedTime}`);

		// const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		// const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

		return [startDate, endDate];
	} else {
		return null;
	}
}
function getDayIndex(dateString: string): number {
	switch (dateString.toLowerCase().trim()) {
		case 'sun':
			return 0;
		case 'mon':
			return 1;
		case 'tue':
		case 'tues':
			return 2;
		case 'wed':
		case 'weds':
			return 3;
		case 'thu':
		case 'thurs':
			return 4;
		case 'fri':
			return 5;
		case 'sat':
			return 6;
		default:
			throw new Error('Invalid day');
	}
}
function handleDateWithHyphen(
	inputString: string,
	timeResult: [Date, Date]
): RestaurantOpeningHour {
	const [startEndDayOfWeekName, endEndDayOfWeekName] = inputString.split(/\s*-\s*/);

	return {
		startDayOfWeek: getDayIndex(startEndDayOfWeekName),
		startTimeHours: timeResult[0].getHours(),
		startTimeMinutes: timeResult[0].getMinutes(),
		endDayOfWeek: getDayIndex(endEndDayOfWeekName),
		endTimeHours: timeResult[1].getHours(),
		endTimeMinutes: timeResult[1].getMinutes(),
	};
}
function getOpeningHours(inputString: string): RestaurantOpeningHour[] | null {
	const dates: RestaurantOpeningHour[] = [];
	const match = inputString.match(/\d/);
	if (match) {
		const index = inputString.indexOf(match[0]);
		const dayOfWeekResult = inputString.substring(0, index);
		const timeResult = getTime(inputString.slice(index));

		if (timeResult) {
			if (dayOfWeekResult.includes(',')) {
				const [startDayOfWeekName, endDayOfWeekName] = dayOfWeekResult.split(', ');

				if (startDayOfWeekName.includes('-')) {
					dates.push(handleDateWithHyphen(startDayOfWeekName, timeResult));
				} else {
					dates.push({
						startDayOfWeek: getDayIndex(startDayOfWeekName),
						startTimeHours: timeResult[0].getHours(),
						startTimeMinutes: timeResult[0].getMinutes(),
						endDayOfWeek: getDayIndex(startDayOfWeekName),
						endTimeHours: timeResult[1].getHours(),
						endTimeMinutes: timeResult[1].getMinutes(),
					});
				}

				if (endDayOfWeekName.includes('-')) {
					dates.push(handleDateWithHyphen(endDayOfWeekName, timeResult));
				} else {
					dates.push({
						startDayOfWeek: getDayIndex(endDayOfWeekName),
						startTimeHours: timeResult[0].getHours(),
						startTimeMinutes: timeResult[0].getMinutes(),
						endDayOfWeek: getDayIndex(endDayOfWeekName),
						endTimeHours: timeResult[1].getHours(),
						endTimeMinutes: timeResult[1].getMinutes(),
					});
				}
			} else if (dayOfWeekResult.includes('-')) {
				dates.push(handleDateWithHyphen(dayOfWeekResult, timeResult));
			} else {
				dates.push({
					startDayOfWeek: getDayIndex(dayOfWeekResult),
					startTimeHours: timeResult[0].getHours(),
					startTimeMinutes: timeResult[0].getMinutes(),
					endDayOfWeek: getDayIndex(dayOfWeekResult),
					endTimeHours: timeResult[1].getHours(),
					endTimeMinutes: timeResult[1].getMinutes(),
				});
			}
			return dates;
		}
	}

	return null;
	// is null, then just ignore
}
export function parseOpeningHours(rawOpeningHours: string) {
	const rawOpeningHoursArray = rawOpeningHours.split(' / ');

	let openingHours: RestaurantOpeningHour[] = [];
	for (const openingHour of rawOpeningHoursArray) {
		let current = getOpeningHours(openingHour);
		if (current) {
			openingHours = openingHours.concat(current);
		}
	}
	return openingHours;
}
/* end of handle opening hours of restaurant */

export function getUserData(): Customer[] {
	let data: Customer[] = [];
	for (const user of _rawUserData) {
		let purchaseHistory: CustomerPurchaseHistory[] = [];
		for (const purchase of user.purchaseHistory) {
			purchaseHistory.push({
				dishName: purchase.dishName,
				restaurantName: purchase.restaurantName,
				transactionDate: new Date(purchase.transactionDate),
				transactionAmount: Math.floor(purchase.transactionAmount * 100),
			});
		}
		data.push({
			id: user.id,
			firstName: user.name.split(' ')[0],
			lastName: user.name.split(' ')[1],
			cashBalance: Math.floor(user.cashBalance * 100),
			purchaseHistory: purchaseHistory,
		});
	}
	return data;
}
