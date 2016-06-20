/* eslint-env browser */

export function detectEndianness() {
  const u16 = new Uint16Array([0x1234]);
  const u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x34 ? 'LE' : 'BE';
}

export function decodeBase64(input) {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(input);
  }
  if (typeof Buffer === 'function') {
    return new Buffer(input, 'base64').toString('binary');
  }
  throw new Error('Unable to decode base64 string');
}

export function formatSize(size) {
  if (typeof size !== 'number') {
    return undefined;
  }
  if (Math.abs(size) < 1024) {
    return size + ' B';
  }
  if (Math.abs(size) < 1024 * 1024) {
    return ~~(size / 1024) + ' KB';
  }
  return ~~(size / (1024 * 1024)) + ' MB';
}

export function roundUpToPow2(number) {
  let result = 1;
  while (result < number) {
    result *= 2;
  }
  return result;
}
