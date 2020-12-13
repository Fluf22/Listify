import axios, { AxiosRequestConfig } from "axios";
import { queryCache, useMutation, useQuery } from "react-query";
import netlifyIdentity from 'netlify-identity-widget';
import { IWish } from "../interfaces";

const axiosCfg: AxiosRequestConfig = {
	baseURL: "/.netlify/functions",
	headers: {
		Authorization: "Bearer " + netlifyIdentity.currentUser()?.token?.access_token
	}
};

export const useGetAllWishes = () => useQuery("wishes", () => axios.request({
	method: "GET",
	url: "/wishes",
	...axiosCfg
}).then((res) => res.data));

export const usePostWish = () => useMutation((wishToPost: IWish) => axios.request({
	method: "POST",
	url: "/wishes",
	data: wishToPost,
	...axiosCfg
}), {
	onSuccess: () => {
		queryCache.invalidateQueries("wishes")
	},
});

export const usePutWish = () => useMutation(({ wishID, wishToPost }: { wishID: string, wishToPost: IWish }) => axios.request({
	method: "PUT",
	url: `/wishes/${wishID}`,
	data: wishToPost,
	...axiosCfg
}), {
	onSuccess: () => {
		queryCache.invalidateQueries("wishes")
	},
});

export const useDeleteWish = () => useMutation((wishID: string) => axios.request({
	method: "DELETE",
	url: `/wishes/${wishID}`,
	...axiosCfg
}), {
	onSuccess: () => {
		queryCache.invalidateQueries("wishes")
	},
});
