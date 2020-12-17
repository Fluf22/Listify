export interface IWish {
	id?: string;
	title: string;
	link: string;
	imageURL: string;
	price: string;
	created: {
		for: string;
		by?: string;
	};
	offeredBy?: {
		name: string;
		percentage: number;
	}[];
};

export interface IUser {
	email: string;
	name: string;
};
