import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";

const useChapters = (bookID: string, axiosCfg: AxiosRequestConfig) => {
	return useQuery(["chapters", bookID], () => axios.request({
		url: `/book/${bookID}/chapter`,
		...axiosCfg
	}).then((res) => res.data));
};

export default useChapters;
