# MiRestcon IA - PWA APIs Premium: Guia Completa
> Investigacion exhaustiva de todas las APIs disponibles para PWA en iOS y Android (2025)
> Para implementar microinteracciones premium en el sistema de restaurantes

---

## Matriz de Compatibilidad Rapida

| API | iOS Safari | Android Chrome | Prioridad MiRestcon |
|-----|-----------|---------------|-------------------|
| **Push Notifications** | 16.4+ (instalado) | FULL | ALTA |
| **Badging API** | 16.4+ (parcial) | Auto via notif | ALTA |
| **Vibration API** | NO | FULL | MEDIA |
| **Screen Wake Lock** | 18.4+ | FULL | CRITICA |
| **Web Share API** | FULL | FULL | ALTA |
| **BarcodeDetector** | NO (usar zxing-js) | FULL | ALTA |
| **WebAuthn/Passkeys** | 16+ FULL | FULL | ALTA |
| **View Transitions** | 18+ | FULL | MEDIA |
| **CSS safe-area (notch)** | FULL | FULL | CRITICA |
| **Payment Request** | FULL (Apple Pay) | FULL (Google Pay) | MEDIA |
| **Media Session** | 15+ parcial | FULL | BAJA |
| **Background Sync** | NO | FULL | ALTA |
| **Contact Picker** | NO | FULL | BAJA |
| **Geolocation** | FULL | FULL | MEDIA |
| **Speech Synthesis** | FULL | FULL | MEDIA |
| **Speech Recognition** | ROTO en PWA | FULL | BAJA |
| **Web Bluetooth** | NO | Parcial | BAJA |
| **Web NFC** | NO | Parcial | BAJA |
| **IndexedDB** | Parcial (500MB) | FULL | CRITICA |
| **Clipboard API** | Parcial | FULL | MEDIA |
| **Idle Detection** | NO | Parcial | MEDIA |
| **Screen Orientation Lock** | NO | FULL | BAJA |
| **Manifest Shortcuts** | NO | FULL | ALTA |
| **Network Information** | NO | Parcial | MEDIA |

---

## TIER 1: Implementar YA (Cross-Platform)
> Funcionan en iOS Y Android. Son el core de la experiencia premium.

---

### 1. Push Notifications (Web Push API)

**Que hace:** Enviar notificaciones al usuario aunque la app este cerrada.

**Soporte:**
- iOS 16.4+: Solo funciona cuando la PWA esta INSTALADA en home screen. NO funciona en Safari browser. NO disponible en paises de la EU (restriccion DMA).
- Android: Soporte completo desde Chrome 50+. Funciona en browser y PWA.
- iOS 18.4 agrego "Declarative Web Push" (mas simple, sin service worker obligatorio).

**Codigo:**
```javascript
// Registrar push
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
});
await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });

// En service worker - recibir push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-badge.png',
      actions: [
        { action: 'ver', title: 'Ver Pedido' },
        { action: 'aceptar', title: 'Aceptar' }
      ],
      data: { orderId: data.orderId }
    })
  );
});
```

**Uso en MiRestcon IA:**
- Cocina: "Nuevo pedido Mesa 7 - Lomo Saltado x2"
- Mesero: "Tu pedido de Mesa 3 esta listo para servir"
- Admin: "Alerta: Stock de arroz bajo minimo"
- Cajero: "Cierre de caja pendiente"

---

### 2. Badging API

**Que hace:** Muestra un numero sobre el icono de la app en el home screen (como WhatsApp).

**Soporte:**
- iOS 16.4+: Funciona, requiere permiso de notificaciones primero.
- Android: El badge se muestra automaticamente basado en notificaciones del sistema.

**Codigo:**
```javascript
// Mostrar badge con numero
if ('setAppBadge' in navigator) {
  await navigator.setAppBadge(5); // "5" sobre el icono
}

// Limpiar badge
await navigator.clearAppBadge();

// Uso practico
async function updateOrderBadge() {
  const pending = await fetch('/api/orders/pending/count');
  const { count } = await pending.json();
  if ('setAppBadge' in navigator) {
    count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge();
  }
}
```

**Uso en MiRestcon IA:**
- Mostrar numero de pedidos pendientes en el icono
- Notificaciones sin leer del equipo
- Alertas de inventario critico

---

### 3. Screen Wake Lock API

**Que hace:** Evita que la pantalla se apague/bloquee mientras la app esta activa.

**Soporte:**
- iOS 18.4+: FUNCIONA (bug corregido en marzo 2025). Antes estaba roto en PWAs.
- Android: FULL desde Chrome 84+.

**Codigo:**
```javascript
let wakeLock = null;

async function activarPantallaEncendida() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      
      // Re-adquirir cuando la app vuelve a primer plano (requerido en iOS)
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && !wakeLock) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      });
    } catch (err) {
      console.error('Wake Lock denegado:', err);
    }
  }
}

// Liberar cuando no se necesite
async function liberarPantalla() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}
```

**Uso en MiRestcon IA (CRITICO):**
- Vista de cocina: pantalla SIEMPRE encendida durante el servicio
- Tablero de pedidos activos
- Mapa de mesas en tiempo real
- Display de turno de espera

---

### 4. CSS safe-area-inset (Soporte de Notch/Dynamic Island)

**Que hace:** Variables CSS que indican el espacio del notch, Dynamic Island, y home indicator para que el contenido no se tape.

**Soporte:**
- iOS 11+: FULL. Apple lo creo.
- Android: FULL desde Chrome 69+.

**Codigo:**
```html
<!-- REQUERIDO en TODAS las vistas -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

```css
/* Header que respeta el notch/Dynamic Island */
.app-header {
  padding-top: calc(env(safe-area-inset-top) + 12px);
}

/* Bottom nav que respeta el home indicator del iPhone */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Sidebar que respeta los bordes curvos */
.sidebar {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Ejemplo completo para MiRestcon */
.order-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: max(env(safe-area-inset-top), 20px);
  padding-left: env(safe-area-inset-left, 16px);
  padding-right: env(safe-area-inset-right, 16px);
  background: linear-gradient(135deg, #10152f, #0a0f24);
}
```

**ACCION INMEDIATA para MiRestcon IA:**
- Actualmente solo `dashboard.ejs` tiene `viewport-fit=cover`
- DEBE estar en TODAS las vistas EJS
- Agregar safe-area-inset a header, bottom-nav, sidebar, y modals

---

### 5. Web Share API

**Que hace:** Abre el menu nativo de compartir del telefono (WhatsApp, email, SMS, etc).

**Soporte:**
- iOS 12.2+: FULL (texto/URL). iOS 15+ soporta archivos.
- Android: FULL desde Chrome 61+. Archivos desde Chrome 76+.

**Codigo:**
```javascript
async function compartirRecibo(orden) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Orden #${orden.id} - Mesa ${orden.mesa}`,
        text: `${orden.items.join(', ')} - Total: S/. ${orden.total}`,
        url: `https://mirestconia.com/orden/${orden.id}`
      });
    } catch (err) {
      // Usuario cancelo o error
    }
  }
}

// Compartir con archivo (recibo PDF)
async function compartirPDF(blob, filename) {
  const file = new File([blob], filename, { type: 'application/pdf' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Recibo MiRestcon' });
  }
}
```

**Uso en MiRestcon IA:**
- Compartir recibo por WhatsApp al cliente
- Enviar reporte diario al dueno por email
- Compartir promocion del dia en redes
- Enviar menu digital a clientes

---

### 6. WebAuthn / Passkeys (Login con Huella/Face ID)

**Que hace:** Login sin contrasena usando biometria del dispositivo (Face ID, Touch ID, huella).

**Soporte:**
- iOS 16+: FULL con iCloud Keychain.
- Android 9+: FULL con Google Password Manager.

**Codigo:**
```javascript
// Crear passkey (registro)
async function registrarPasskey(usuario) {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: await getServerChallenge(),
      rp: { name: 'MiRestcon IA', id: 'mirestconia.com' },
      user: {
        id: new TextEncoder().encode(usuario.id),
        name: usuario.email,
        displayName: usuario.nombre
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: { residentKey: 'required' }
    }
  });
  await saveCredentialToServer(credential);
}

// Login con passkey
async function loginConBiometria() {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: await getServerChallenge(),
      rpId: 'mirestconia.com'
    }
  });
  const result = await verifyOnServer(assertion);
  if (result.ok) redirectToDashboard();
}
```

**Uso en MiRestcon IA:**
- Staff: login con huella/Face ID en vez de contrasena
- Manager: autorizacion biometrica para descuentos o anulaciones
- Cajero: confirmacion biometrica para cierre de caja

---

### 7. IndexedDB (Base de datos offline)

**Que hace:** Base de datos transaccional completa en el navegador. Soporte para queries complejas.

**Soporte:**
- iOS 8+: Parcial. Limite ~500MB. Datos pueden ser borrados si la PWA no se usa por tiempo prolongado.
- Android: FULL. Hasta 60% del disco.

**Codigo:**
```javascript
// Usando idb (wrapper moderno)
import { openDB } from 'idb';

const db = await openDB('mirestcon-db', 1, {
  upgrade(db) {
    const orders = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
    orders.createIndex('status', 'status');
    orders.createIndex('mesa', 'mesaId');
    db.createObjectStore('menu', { keyPath: 'itemId' });
    db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true });
  }
});

// Guardar pedido offline
await db.put('orders', {
  mesaId: 7,
  items: [{ nombre: 'Lomo Saltado', qty: 2, precio: 25 }],
  status: 'pending',
  timestamp: Date.now()
});

// Leer pedidos pendientes
const pendientes = await db.getAllFromIndex('orders', 'status', 'pending');
```

**Uso en MiRestcon IA (CRITICO):**
- Tomar pedidos sin conexion
- Cache completo del menu
- Cola de sincronizacion cuando vuelve el WiFi
- Historial de transacciones local

---

### 8. View Transitions API

**Que hace:** Transiciones animadas nativas entre paginas/estados, como una app nativa.

**Soporte:**
- iOS/Safari 18+: Funciona (same-document). Safari 18.2+ para cross-document.
- Android: FULL desde Chrome 111+.

**Codigo:**
```javascript
// Transicion al cambiar de vista
function irAPedidos() {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      renderPedidosView();
    });
  } else {
    renderPedidosView(); // Fallback sin animacion
  }
}
```

```css
/* Animacion de la transicion */
::view-transition-old(root) {
  animation: slide-out-left 0.25s ease-in;
}
::view-transition-new(root) {
  animation: slide-in-right 0.25s ease-out;
}

@keyframes slide-out-left {
  to { transform: translateX(-100%); opacity: 0; }
}
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
}
```

**Uso en MiRestcon IA:**
- Transiciones fluidas entre Menu > Pedidos > Caja
- Animacion al expandir detalle de un pedido
- Cambio animado entre mapa de mesas y lista

---

## TIER 2: Mejoras Android (Progressive Enhancement)
> Agregan valor significativo en Android. En iOS se ignoran gracefully.

---

### 9. Vibration API

**iOS:** NO soportado (Apple lo bloqueo).
**Android:** FULL desde Chrome 32+.

```javascript
if ('vibrate' in navigator) {
  // Confirmacion de pedido
  navigator.vibrate(200);
  
  // Alerta urgente (patron)
  navigator.vibrate([100, 50, 100, 50, 300]);
  
  // Feedback tactil al tocar boton
  navigator.vibrate(50);
}
```

**Uso:** Feedback haptico al confirmar pedido, alerta urgente en cocina, confirmacion de pago.

---

### 10. Manifest Shortcuts (Accesos rapidos)

**iOS:** NO soportado.
**Android:** FULL desde Chrome 84+. Muestra hasta 4 shortcuts al hacer long-press en el icono.

```json
// manifest.json
{
  "shortcuts": [
    {
      "name": "Nuevo Pedido",
      "short_name": "Pedido",
      "url": "/orders/new",
      "icons": [{ "src": "/icons/shortcut-order.png", "sizes": "96x96" }]
    },
    {
      "name": "Ver Mesas",
      "short_name": "Mesas",
      "url": "/tables",
      "icons": [{ "src": "/icons/shortcut-tables.png", "sizes": "96x96" }]
    },
    {
      "name": "Caja",
      "short_name": "Caja",
      "url": "/caja",
      "icons": [{ "src": "/icons/shortcut-cash.png", "sizes": "96x96" }]
    },
    {
      "name": "Reportes",
      "short_name": "Reportes",
      "url": "/reportes",
      "icons": [{ "src": "/icons/shortcut-reports.png", "sizes": "96x96" }]
    }
  ]
}
```

---

### 11. Background Sync API

**iOS:** NO soportado. Requiere fallback manual.
**Android:** FULL desde Chrome 49+.

```javascript
// Registrar sync cuando falla un envio
async function enviarPedido(pedido) {
  try {
    await fetch('/api/orders', { method: 'POST', body: JSON.stringify(pedido) });
  } catch {
    // Sin conexion: guardar y registrar sync
    await guardarEnCola(pedido);
    const reg = await navigator.serviceWorker.ready;
    if ('sync' in reg) {
      await reg.sync.register('sync-pedidos');
    }
  }
}

// En service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    event.waitUntil(enviarPedidosPendientes());
  }
});

// Fallback iOS: retry manual
window.addEventListener('online', () => {
  enviarPedidosPendientes();
});
```

---

### 12. BarcodeDetector / QR Scanner

**iOS:** NO soportado nativamente. Usar libreria `zxing-js`.
**Android:** Chrome 83+ con aceleracion por hardware.

```javascript
async function escanearCodigo(videoElement) {
  if ('BarcodeDetector' in window) {
    // Android: API nativa
    const detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
    const barcodes = await detector.detect(videoElement);
    return barcodes.map(b => b.rawValue);
  } else {
    // iOS fallback: usar zxing-js
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const reader = new BrowserMultiFormatReader();
    const result = await reader.decodeOnceFromVideoElement(videoElement);
    return [result.getText()];
  }
}
```

**Uso:** Escanear productos para inventario, QR de mesa, codigos de barras de proveedores.

---

### 13. Web Share Target (Recibir compartidos)

**iOS:** NO soportado.
**Android:** FULL desde Chrome 76+.

```json
// manifest.json - registrar la PWA como destino de compartir
{
  "share_target": {
    "action": "/share-handler",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "images", "accept": ["image/*"] }]
    }
  }
}
```

**Uso (Android):** Recibir fotos de la camara para adjuntar a inventario, recibir PDF de facturas de email.

---

### 14. Contact Picker API

**iOS:** NO soportado.
**Android:** Chrome 80+.

```javascript
if ('contacts' in navigator) {
  const contacts = await navigator.contacts.select(
    ['name', 'tel'],
    { multiple: false }
  );
  if (contacts.length) {
    const supplier = contacts[0];
    fillSupplierForm(supplier.name[0], supplier.tel[0]);
  }
}
```

**Uso (Android):** Agregar contacto de proveedor desde la agenda, buscar telefono de cliente para delivery.

---

## TIER 3: APIs de Valor Agregado

---

### 15. Payment Request API (Apple Pay / Google Pay)

```javascript
const request = new PaymentRequest(
  [{
    supportedMethods: 'https://apple.com/apple-pay',
    data: { merchantIdentifier: 'merchant.com.mirestcon' }
  }, {
    supportedMethods: 'https://google.com/pay',
    data: { /* Google Pay config */ }
  }],
  {
    total: { label: 'MiRestcon IA', amount: { currency: 'PEN', value: '58.00' } }
  }
);
const response = await request.show();
```

**Uso:** Pago directo del cliente desde la PWA (Apple Pay en iOS, Google Pay en Android). Sin comision del 30% de Apple en web.

---

### 16. Media Session API (Controles en pantalla de bloqueo)

```javascript
navigator.mediaSession.metadata = new MediaMetadata({
  title: 'Musica Ambiente',
  artist: 'MiRestcon Radio',
  artwork: [{ src: '/icons/music-512.png', sizes: '512x512' }]
});
navigator.mediaSession.setActionHandler('play', () => audio.play());
navigator.mediaSession.setActionHandler('pause', () => audio.pause());
navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
```

**Uso:** Controlar musica ambiente del restaurante desde la pantalla de bloqueo.

---

### 17. Geolocation API

```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    calcularDistanciaDelivery(latitude, longitude);
  },
  (err) => console.error(err),
  { enableHighAccuracy: true, timeout: 5000 }
);
```

**Uso:** Calcular distancia de delivery, confirmar ubicacion del repartidor, mostrar mapa para el cliente.

---

### 18. Speech Synthesis (Texto a Voz)

```javascript
function anunciarPedido(mesa, plato) {
  const msg = new SpeechSynthesisUtterance(
    `Pedido listo. Mesa ${mesa}. ${plato}`
  );
  msg.lang = 'es-PE';
  msg.rate = 0.9;
  speechSynthesis.speak(msg);
}
```

**Uso:** Anunciar pedidos listos en cocina hands-free, leer alertas en voz alta.

---

### 19. Clipboard API

```javascript
// Copiar numero de orden
await navigator.clipboard.writeText('ORD-2025-0042');

// Copiar link del menu digital
await navigator.clipboard.writeText('https://mirestconia.com/menu/mi-restaurante');
```

**Uso:** Copiar link del menu para pegar en WhatsApp, copiar codigo de orden.

---

### 20. Idle Detection API (Solo Android)

```javascript
if ('IdleDetector' in window) {
  const permission = await IdleDetector.requestPermission();
  if (permission === 'granted') {
    const detector = new IdleDetector();
    detector.addEventListener('change', () => {
      if (detector.userState === 'idle') {
        bloquearPantallaPOS(); // Seguridad: bloquear despues de 2 min
      }
    });
    await detector.start({ threshold: 120000 }); // 2 minutos
  }
}
```

**Uso:** Auto-bloqueo del POS por seguridad, volver a home en kiosk mode.

---

### 21. Network Information API (Solo Android)

```javascript
if ('connection' in navigator) {
  const conn = navigator.connection;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
    activarModoOffline();
    reducirCalidadImagenes();
  }
  if (conn.saveData) {
    desactivarAnimaciones();
  }
}
```

**Uso:** Detectar conexion lenta y cambiar a modo offline, reducir carga de imagenes en datos moviles.

---

## TIER 4: NO Implementar (Bloqueado por Apple o no practico)

| API | Razon |
|-----|-------|
| Web Bluetooth | Apple lo bloqueo. Usar apps nativas para impresoras |
| Web NFC | Apple lo bloqueo. Solo Android y limitado |
| Web USB / Serial | Solo desktop Chrome |
| Battery Status | Apple lo bloqueo por privacidad |
| Ambient Light Sensor | Apple lo bloqueo por fingerprinting |
| Screen Capture | No soportado en mobile |
| File System Access | Solo desktop Chrome |
| Speech Recognition en PWA | ROTO en iOS PWA (funciona en Safari tab) |
| Gamepad API | Sin uso practico en restaurantes |

---

## Cambios en iOS que importan

### iOS 16.4 (Marzo 2023)
- Push Notifications habilitadas para PWAs instaladas
- Badging API habilitada
- Manifest icons ahora se usan para el icono de la PWA

### iOS 17.4 - SOLO EU (Marzo 2024)
- REGRESION: Apple elimino modo standalone en la EU (cumplimiento DMA)
- Push, badges y offline dejaron de funcionar para usuarios EU
- Si MiRestcon se expande a Europa, necesitara wrapper nativo

### iOS 18 (Septiembre 2024)
- Media Session: artwork a 512x512 (antes pixelado)
- Service workers mas estables

### iOS 18.4 (Marzo 2025)
- Screen Wake Lock CORREGIDO para PWAs
- Declarative Web Push (push sin service worker obligatorio)
- Cookie Store API

### iOS 26 (WWDC 2025 - Proximo)
- TODO sitio agregado al Home Screen abre como web app por defecto
- WebGPU disponible
- Mejoras en Scroll-driven Animations

---

## Mejores Practicas para Instalacion PWA

### Android: beforeinstallprompt
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Mostrar boton DESPUES de que el usuario complete una accion
  // (ej: despues del primer pedido exitoso)
});

async function mostrarPromptInstalacion() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') trackInstalacion();
  deferredPrompt = null;
}
```

### Mejorar el prompt de Android con screenshots:
```json
// manifest.json
{
  "screenshots": [
    {
      "src": "/screenshots/pedidos-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Gestion de pedidos en tiempo real"
    },
    {
      "src": "/screenshots/cocina-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Vista de cocina con alertas"
    }
  ]
}
```

### iOS: Instrucciones manuales
```javascript
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
  || navigator.standalone === true;

if (isIOS && !isStandalone) {
  // Mostrar banner: "Toca Compartir y luego Agregar a inicio"
  // MiRestcon ya tiene ios-install-banner.js - mejorarlo
}
```

### Regla de oro del timing:
- NUNCA mostrar prompt en la primera visita
- Esperar a que el usuario complete una accion significativa
- Si rechaza, esperar 30 dias antes de mostrar de nuevo
- Estudios muestran que prompts despues de un journey completado convierten 3x mejor

---

## Plan de Implementacion Sugerido

### Fase 1: Fundamentos (Impacto inmediato)
1. `viewport-fit=cover` + `safe-area-inset` en TODAS las vistas
2. Screen Wake Lock en cocina, pedidos, mapa de mesas
3. IndexedDB para operacion offline completa
4. Web Share para compartir recibos por WhatsApp

### Fase 2: Engagement
5. Push Notifications (VAPID server + service worker)
6. Badging API para pedidos pendientes
7. WebAuthn/Passkeys para login biometrico
8. Manifest shortcuts para accesos rapidos (Android)

### Fase 3: Microinteracciones Premium
9. View Transitions entre pantallas
10. Vibration API (Android) para feedback haptico
11. BarcodeDetector/zxing-js para scanner de productos
12. Speech Synthesis para anuncios en cocina

### Fase 4: Avanzado
13. Background Sync para cola de pedidos offline
14. Payment Request API (Apple Pay / Google Pay)
15. beforeinstallprompt mejorado con screenshots
16. Media Session para musica ambiente

---

## Notas Importantes

1. **Peru y la EU:** MiRestcon opera en Peru, asi que las restricciones DMA de iOS no aplican. Push notifications y standalone mode funcionan normalmente.

2. **Feature detection siempre:** Nunca asumir que una API existe. Siempre verificar con `if ('api' in navigator)` antes de usar.

3. **iOS es el cuello de botella:** La mayoria de APIs avanzadas no funcionan en iOS. Disenar para Android primero y degradar gracefully en iOS.

4. **PWA instalada vs browser:** Muchas APIs (Push, Badge, Wake Lock) solo funcionan cuando la PWA esta INSTALADA. El flujo de instalacion es critico.

5. **HTTPS obligatorio:** Todas estas APIs requieren HTTPS. MiRestcon ya usa HTTPS en produccion.
