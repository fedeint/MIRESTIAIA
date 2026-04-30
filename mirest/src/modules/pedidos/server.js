const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { renderForDevice } = require('./lib/deviceRouter');
const { getPedidosViewModel } = require('./services/pedidoService');
const { createRoundSchema, paymentSchema, validate } = require('./validators/pedidoSchemas');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 15552000,
    includeSubDomains: true,
    preload: false,
  },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));

app.use(express.json({ limit: '120kb' }));
app.use(express.urlencoded({ extended: false, limit: '120kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  fallthrough: true,
  maxAge: '1h',
  index: false,
}));

const pedidosApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'RATE_LIMITED',
    message: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
  },
});

app.get('/pedidos', renderForDevice('pedidos', 'pedidos-desktop', () => getPedidosViewModel()));

app.post('/api/pedidos/rondas', pedidosApiLimiter, validate(createRoundSchema), (req, res) => {
  res.status(202).json({
    ok: true,
    message: 'Ronda validada. Pendiente de persistencia real.',
    data: req.validatedBody,
  });
});

app.post('/api/pedidos/pagos', pedidosApiLimiter, validate(paymentSchema), (req, res) => {
  res.status(202).json({
    ok: true,
    message: 'Pago validado. Pendiente de integración con caja/facturación.',
    data: req.validatedBody,
  });
});

app.use((req, res) => {
  const isHtmlNavigation = req.method === 'GET'
    && req.accepts('html')
    && !req.path.startsWith('/api/')
    && !path.extname(req.path);

  if (isHtmlNavigation) {
    return res.redirect(302, '/pedidos');
  }
  res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

app.use((error, req, res, _next) => {
  console.error('[server] Error no controlado:', error);
  res.status(500).json({ ok: false, error: 'INTERNAL_SERVER_ERROR' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.info(`[server] MiRestcon IA Pedidos escuchando en http://localhost:${PORT}/pedidos`);
  });
}

module.exports = app;
