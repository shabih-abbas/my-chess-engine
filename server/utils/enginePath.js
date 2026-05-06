import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export function getEnginePath(){
    return path.resolve(dirname, '..', '..', 'engine', 'engine.exe');
}

export function getEnginePwd(){
    return path.resolve(dirname, '..', '..', 'engine');
}