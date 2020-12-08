import { AxiosRequestConfig } from "axios";
import charactersQuery from './characters';
import booksQuery from './books';
import chaptersQuery from './chapters';
import moviesQuery from './movies';
import quotesQuery from './quotes';

export const axiosCfg: AxiosRequestConfig = {
	method: "GET",
	baseURL: process.env.REACT_APP_API_URL,
	headers: {
		Authorization: "Bearer " + process.env.REACT_APP_API_ACCESS_TOKEN
	}
};

export const useCharacters = () => charactersQuery(axiosCfg);
export const useBooks = () => booksQuery(axiosCfg);
export const useChapters = (bookID: string) => chaptersQuery(bookID, axiosCfg);
export const useMovies = () => moviesQuery(axiosCfg);
export const useQuotes = (movieID: string = "") => quotesQuery(movieID, axiosCfg);
