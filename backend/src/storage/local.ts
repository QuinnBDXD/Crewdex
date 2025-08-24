import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ROOT = path.resolve(__dirname, '../../data');

export class LocalStorage {
  /**
   * Save a file buffer to the local filesystem and return a storage key.
   */
  async save(data: Buffer, filename: string): Promise<string> {
    const key = `${uuidv4()}-${filename}`;
    const filePath = path.join(ROOT, key);
    await fs.mkdir(ROOT, { recursive: true });
    await fs.writeFile(filePath, data);
    return key;
  }
}

export default new LocalStorage();
