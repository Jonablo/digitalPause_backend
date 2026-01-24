import { webcrypto } from 'crypto';

if (!global.crypto) {
  // @ts-ignore
  global.crypto = webcrypto;
}
