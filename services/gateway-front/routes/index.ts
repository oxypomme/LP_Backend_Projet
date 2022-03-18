import { Router } from "express";
import type { Filter, Options } from "http-proxy-middleware";
import {
	createProxyMiddleware,
	responseInterceptor,
} from "http-proxy-middleware";

const API_CATALOGUE = "http://lbs_catalogue:8055";
const API_COMMANDE = "http://lbs_commandes:3000";

const router = Router();

type Route = {
	url: string;
	proxy: Filter | Options;
};

const flattenObject = (data: any, property: string) => {
	const result = [];
	for (const subdata of data) {
		result.push(subdata[property]);
	}
	return result;
};

const routes: Route[] = [
	{
		url: "/sandwichs",
		proxy: {
			target: API_CATALOGUE,
			changeOrigin: true,
			pathRewrite: {
				[`^/sandwichs`]: "/items/sandwich",
			},
			selfHandleResponse: true,
			/**
			 * Including 1 level of nested object
			 */
			onProxyReq: (pReq) => {
				const parsed = new URL(pReq.path, API_CATALOGUE);
				const query = parsed.searchParams;
				query.set(
					"fields",
					query.get("fields") ?? "*,categories.category_id.*"
				);
				parsed.search = "?" + query.toString();
				pReq.path = parsed.href;
			},
			/**
			 * Flatten categories of sandwich
			 */
			onProxyRes: responseInterceptor(async (buffer) => {
				let { data } = JSON.parse(buffer.toString("utf-8"));

				if (data instanceof Array) {
					for (let i = 0; i < data.length; i++) {
						data[i] = Object.assign({}, data[i], {
							categories: flattenObject(data[i].categories, "category_id"),
						});
					}
				} else {
					data = Object.assign({}, data, {
						categories: flattenObject(data.categories, "category_id"),
					});
				}

				return JSON.stringify(data);
			}),
		},
	},
	{
		url: "/categories/:id/sandwichs",
		proxy: {
			target: API_CATALOGUE,
			changeOrigin: true,
			pathRewrite: {
				[`^/categories/(.*?)/sandwichs`]: "/items/sandwich_category",
			},
			selfHandleResponse: true,
			/**
			 * Including 1 level of nested object
			 * + filtering data
			 */
			onProxyReq: (pReq, req) => {
				const parsed = new URL(pReq.path, API_CATALOGUE);
				const query = parsed.searchParams;
				query.set(
					"filter",
					query.get("filter") ?? `{"category_id": {"_eq": ${req.params.id}}}`
				);
				query.set("fields", query.get("fields") ?? "sandwich_id.*");
				parsed.search = "?" + query.toString();
				pReq.path = parsed.href;
			},
			/**
			 * Fetch sandwichs of categories
			 */
			onProxyRes: responseInterceptor(async (buffer) => {
				let { data } = JSON.parse(buffer.toString("utf-8"));

				return JSON.stringify(flattenObject(data, "sandwich_id"));
			}),
		},
	},
	{
		url: "/categories",
		proxy: {
			target: API_CATALOGUE,
			changeOrigin: true,
			pathRewrite: {
				[`^/categories`]: "/items/category",
			},
			selfHandleResponse: true,
			/**
			 * Fetch sandwichs of categories
			 */
			onProxyRes: responseInterceptor(async (buffer) => {
				let { data } = JSON.parse(buffer.toString("utf-8"));

				if (data instanceof Array) {
					for (let i = 0; i < data.length; i++) {
						data[i] = Object.assign({}, data[i], {
							links: {
								self: { href: `./${data[i].id}` },
								sandwichs: {
									href: `./${data[i].id}/sandwichs`,
								},
							},
						});
					}
				} else {
					data = Object.assign({}, data, {
						links: {
							self: { href: "." },
							sandwichs: { href: "./sandwichs" },
						},
					});
				}

				return JSON.stringify(data);
			}),
		},
	},
	{
		url: "/commandes/:id",
		proxy: {
			target: API_COMMANDE,
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
