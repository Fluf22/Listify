import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";

const useBooks = (axiosCfg: AxiosRequestConfig) => {
	return useQuery("books", () => axios.request({
		url: "/book",
		...axiosCfg
	}).then((res) => res.data));
};

export default useBooks;
