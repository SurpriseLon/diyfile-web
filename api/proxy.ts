import { createProxyMiddleware } from 'http-proxy-middleware'

const apiProxy = createProxyMiddleware({
  target: 'https://pic.furrysp.top/@api',
  changeOrigin: true,
  pathRewrite: {
    '^/@api/': '/',
  },
})

export default apiProxy
