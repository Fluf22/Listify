import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";
import netlifyIdentity from 'netlify-identity-widget';

const axiosCfg: AxiosRequestConfig = {
	baseURL: "/.netlify/functions",
	headers: {
		Authorization: "Bearer " + netlifyIdentity.currentUser()?.token?.access_token
	}
};

export const useGetUsers = () => useQuery("users", () => axios.request({
	method: "GET",
	url: "/users",
	...axiosCfg
}).then((res) => res.data).catch(err => {
	console.log("Err retrieving wishes: ", err);
}).finally(() => netlifyIdentity.refresh()));
