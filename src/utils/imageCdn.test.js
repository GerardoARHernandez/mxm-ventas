import { describe, it, expect } from 'vitest';
import { cdnImg } from './imageCdn';

const SOURCE = 'https://systemweb.ddns.net/CarritoWeb/imgMXM/Catalogo/foto1.jpg';

describe('cdnImg', () => {
  it('builds a weserv URL that resizes to the given width and serves webp', () => {
    const result = cdnImg(SOURCE, 300);

    expect(result).toBe(
      `https://images.weserv.nl/?url=${encodeURIComponent(SOURCE)}&w=300&output=webp&q=80`
    );
  });

  it('defaults to width 600 when no width is provided', () => {
    const result = cdnImg(SOURCE);

    expect(result).toContain('&w=600&');
  });

  it('url-encodes the source so query params are not broken', () => {
    const result = cdnImg(SOURCE, 300);

    // The raw "https://" of the source must not leak unencoded into the proxy URL
    expect(result.indexOf('https://')).toBe(0);
    expect(result.slice('https://images.weserv.nl/'.length)).not.toContain('https://');
  });

  it('returns the input unchanged when the url is empty or missing', () => {
    expect(cdnImg('', 300)).toBe('');
    expect(cdnImg(undefined, 300)).toBe(undefined);
  });
});
