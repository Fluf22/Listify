import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";

const useCharacters = (axiosCfg: AxiosRequestConfig) => {
	return useQuery("characters", () => axios.request({
		url: "/character",
		...axiosCfg
	}).then((res) => res.data));
};

export default useCharacters;
