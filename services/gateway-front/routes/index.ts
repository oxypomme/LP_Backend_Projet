import axios from "axios";
import { Router } from "express";
import type { Filter, Options } from "http-proxy-middleware";
import {
	createProxyMiddleware,
	responseInterceptor,
} from "http-proxy-middleware";

const router = Router();

type Route = {
	url: string;
	proxy: Filter | Options;
};

const findCategs = async (data: any) => {
	const { data: categs } = await axios.get(
		`http://lbs_catalogue:8055/items/category/`
	);

	return {
		categories: data.categories.map((cid: number) =>
			categs.data.find(({ id }: any) => cid === id)
		),
	};
};

const routes: Route[] = [
	{
		url: "/sandwichs",
		proxy: {
			target: "http://lbs_catalogue:8055",
			changeOrigin: true,
			pathRewrite: {
				[`^/sandwichs`]: "/items/sandwich",
			},
			selfHandleResponse: true,
			/**
			 * Fetch categories of sandwich
			 */
			onProxyRes: responseInterceptor(async (buffer) => {
				let { data } = JSON.parse(buffer.toString("utf-8"));

				if (data instanceof Array) {
					for (let i = 0; i < data.length; i++) {
						data[i] = Object.assign({}, data[i], await findCategs(data[i]));
					}
				} else {
					data = Object.assign({}, data, await findCategs(data));
				}

				return JSON.stringify(data);
			}),
		},
	},
	{
		url: "/categories",
		proxy: {
			target: "http://lbs_catalogue:8055",
			changeOrigin: true,
			pathRewrite: {
				[`^/categories`]: "/items/category",
			},
		},
	},
	{
		url: "/commandes/:id",
		proxy: {
			target: "http://lbs_commandes:3000",
			changeOrigin: true,
			pathRewrite: {
				[`^/commandes`]: "/commandes",
			},
		},
	},
];

for (const r of routes) {
	router.use(r.url, createProxyMiddleware(r.proxy));
}

export default router;
