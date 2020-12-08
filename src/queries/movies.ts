import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";

const useMovies = (axiosCfg: AxiosRequestConfig) => {
	return useQuery("movies", () => axios.request({
		url: "/movie",
		...axiosCfg
	}).then((res) => res.data));
};

export default useMovies;
