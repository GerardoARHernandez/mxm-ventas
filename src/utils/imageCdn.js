// Genera una URL servida por el proxy-CDN gratuito images.weserv.nl, que
// redimensiona y convierte la imagen a WebP al vuelo. Así el navegador
// descarga una miniatura ligera en lugar del original a resolución completa
// alojado en systemweb.ddns.net (sin tocar la API).
//
// url:   URL absoluta de la imagen original.
// width: ancho objetivo en px (el alto se ajusta manteniendo proporción).
export const cdnImg = (url, width = 600) => {
  if (!url) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
};
