const proxy = require('http-proxy-middleware')

module.exports = function(app) {
	app.use(
		'/api',
		proxy({
			target: 'http://3.92.64.124',
			changeOrigin: true
		})
	)
}
