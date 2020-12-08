import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";
import netlifyIdentity from 'netlify-identity-widget';

const axiosCfg: AxiosRequestConfig = {
	method: "GET",
	baseURL: "/.netlify/functions",
	headers: {
		Authorization: "Bearer " + netlifyIdentity.currentUser()?.token?.access_token
	}
};

export const useGetAllWishes = () => {
	return useQuery("wishes", () => axios.request({
		url: "/wishes",
		...axiosCfg
	}).then((res) => res.data));
};
