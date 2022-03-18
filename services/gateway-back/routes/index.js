import { Router } from "express";
import {
	createProxyMiddleware, responseInterceptor,
} from "http-proxy-middleware";
import axios from "axios";

const router = Router();

const routes = [
	{
		url: ["/signup", "/signin"],
		auth: false,
		proxy: {
			target: "http://lbs_authentification:3000",
			changeOrigin: true,
			pathRewrite: {
				[`^/(signup|signin)`]: "/$1",
			},
		},
	},
	{
		url: "/commandes",
		proxy: {
			target: "http://lbs_fabrication:3000",
			changeOrigin: true,
			pathRewrite: {
				[`^/commandes`]: "/commandes",
			},
		},
	},
];

const authMiddleware = async (req, res, next) => {
	try {
		await axios.get('http://lbs_authentification:3000/check', {
			headers: {
				Authorization: req.get('authorization') ?? ''
			}
		})
		next()
	} catch (error) {
		res.status(error.response.status).json(error.response.data);
	}
}

for (const r of routes) {
	if(r.auth === false) {
		router.use(
			r.url,
			createProxyMiddleware(r.proxy)
		);
	} else {
		router.use(
			r.url,
			authMiddleware,
			createProxyMiddleware(r.proxy)
		);
	}
}

export default router;
