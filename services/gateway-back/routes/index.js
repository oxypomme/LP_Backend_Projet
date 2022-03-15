import { Router } from "express";
import {
	createProxyMiddleware, responseInterceptor,
} from "http-proxy-middleware";

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

let _next = undefined;
const authMiddleware = createProxyMiddleware({
	target: "http://lbs_authentification:3000",
	changeOrigin: true,
	pathRewrite: {
		[`^/.*`]: "/check",
	},
	selfHandleResponse: true,
	onProxyRes: responseInterceptor(async (buffer, pRes, req, res) => {
		// _next(req, res);
	})
});

for (const r of routes) {
	if(r.auth === false) {
		router.use(
			r.url,
			createProxyMiddleware(r.proxy)
		);
	} else {
		_next = createProxyMiddleware(r.proxy);
		router.use(
			r.url,
			authMiddleware,
			createProxyMiddleware(r.proxy)
		);
	}
}

export default router;
