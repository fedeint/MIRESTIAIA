const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const pwa = read('views/pedidos.ejs');
const desktop = read('views/pedidos-desktop.ejs');
const tokens = read('public/css/tokens-v2.css');
const server = read('server.js');

assert(pwa.includes('<%# @variant: pwa %>'), 'pedidos.ejs debe incluir marcador @variant pwa');
assert(desktop.includes('<%# @variant: desktop %>'), 'pedidos-desktop.ejs debe incluir marcador @variant desktop');
assert(pwa.includes('DM+Sans'), 'La variante PWA debe cargar DM Sans');
assert(desktop.includes('Inter'), 'La variante Desktop debe cargar Inter');
assert(tokens.includes('--mi-gradient-orange'), 'tokens-v2.css debe exponer el gradiente naranja V2');
assert(tokens.includes('#ef520f') && tokens.includes('#df2c05'), 'tokens-v2.css debe contener el gradiente 8-stop solicitado');
assert(server.includes('renderForDevice'), 'server.js debe usar renderForDevice');
assert(server.includes('helmet('), 'server.js debe configurar Helmet');
assert(server.includes('rateLimit('), 'server.js debe configurar rate limiting');
assert(server.includes('validate(createRoundSchema)'), 'server.js debe validar creación de rondas con Zod');
assert(server.includes('validate(paymentSchema)'), 'server.js debe validar pagos con Zod');

console.info('view-variants OK');
