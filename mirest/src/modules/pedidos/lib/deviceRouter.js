const MOBILE_UA_PATTERN = /android|iphone|ipad|ipod|iemobile|opera mini|mobile/i;

function resolveDeviceVariant(req) {
  const forcedVariant = String(req.query?.variant || '').trim().toLowerCase();
  if (forcedVariant === 'desktop' || forcedVariant === 'pwa') return forcedVariant;

  const explicitHeader = String(req.get?.('x-mirest-device') || '').trim().toLowerCase();
  if (explicitHeader === 'desktop' || explicitHeader === 'pwa') return explicitHeader;

  const userAgent = String(req.get?.('user-agent') || '');
  return MOBILE_UA_PATTERN.test(userAgent) ? 'pwa' : 'desktop';
}

function renderForDevice(pwaView, desktopView, buildLocals = () => ({})) {
  return (req, res, next) => {
    try {
      const variant = resolveDeviceVariant(req);
      const view = variant === 'pwa' ? pwaView : desktopView;
      const locals = buildLocals(req, { variant });

      res.set('Vary', 'User-Agent, X-MiRest-Device');
      res.render(view, {
        ...locals,
        variant,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  renderForDevice,
  resolveDeviceVariant,
};
