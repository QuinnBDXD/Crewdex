import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { TextEncoder, TextDecoder } from 'util';

if (!global.structuredClone) {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
