/*
* http://usejsdoc.org/
*/

import * as fs from 'fs';
import * as crypto from 'crypto';

class HardFile {

    private _inode: number;
    private _size: number;

    constructor(inode: number, size: number) {
        this._inode = inode;
        this._size = size;
    }
    
    get inode(): number {
        return this.inode;
    }
    
    get size(): number {
        return this._size;
    }
}

class LogicFile extends HardFile {
    
    private _path: string;
    private _hash: string;
    private _cryptoEngine: crypto.Hmac;

    constructor(inode: number, size: number, path: string) {
        super(inode, size);
        this._path = path;
    }

    get name(): string {
        return this._path.replace(/.*[\/\\]([^\/\\]+)$/, '$1');
    }
    
    async hash(): Promise<string> {
        
        return new Promise<string>((resolve, reject) => {
            
            if (this._hash != null) {
                return resolve(this._hash);
            }
            
            fs.readFile(this._path, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                
                try {
                    this._cryptoEngine.update(data);
                    this._hash = this._cryptoEngine.digest('hex');
                } catch (error) {
                    return reject(error);
                }
                return resolve(this._hash);
            });
        });
    }
}

export { HardFile, LogicFile }
