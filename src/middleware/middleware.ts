import { NextFunction, Request, Response } from 'express';

export const checkXORQuery =
	(param1: string, param2: string) => (req: Request, res: Response, next: NextFunction) => {
		// Check if both parameters are present
		if (param1 && param2) {
			return res.status(400).json({ error: 'Only one query parameter is allowed' });
		}

		// Check if neither parameter is present
		if (!param1 && !param2) {
			return res.status(400).json({ error: 'One query parameter is required' });
		}

		// If only one parameter is present, move on to the next middleware
		return next();
	};

export const checkBothNumericQuery =
	(param1: string, param2: string) => (req: Request, res: Response, next: NextFunction) => {
		if (!param1 || !param2) {
			return res.status(400).json({ error: 'Both query parameter is required' });
		} else {
			if (!Number.isNaN(parseInt(param1)) || !Number.isNaN(parseInt(param2))) {
				return res.status(400).json({ error: 'Numeric query parameter is required' });
			}
		}
		next();
	};
