/*
* http://usejsdoc.org/
*/

import { LogicFile } from '../entity/File';
import { FileRepository } from '../repository/FileRepository';

import * as fs from 'fs';
import * as winston from 'winston';
import * as platformPath from 'path';

class IndexService {
    
    private static log = winston;
    
    private _fileRepository: FileRepository;

    private _indexJobRepository;
    
    constructor(fileRepository: FileRepository) {
        this._fileRepository = fileRepository;
    }
    
    async index(directory: string): Promise<void> {
        
        return new Promise<void>((resolve, reject) => {
            
            IndexService.log.debug('Indexing directory [%s]', directory);
            fs.readdir(directory, async (err, files) => {
                
                if (err) {
                    IndexService.log.debug('Error reading directory [%s]', directory, err);
                    return reject(err);
                }
                
                IndexService.log.debug('Reading files from directory [%s]', directory);
                for (let file of files) {
                    
                    let filePath = directory.replace(/[\/\\]$/, '') + platformPath.sep + file;
                    
                    await new Promise<void>((resolve, reject) => {
                        
                        fs.stat(filePath, async (err, stats) => {
                            
                            if (err) {
                                //TODO record failure, see what to do with error
                                IndexService.log.debug('Error stating file [%s]', filePath, err);
                                return resolve();
                            }
                            
                            if (stats.isDirectory()) {
                                try {
                                    await this.index(filePath);
                                } catch (error) {
                                    // TODO record failure
                                }
                            } else if (stats.isFile()) {
                                IndexService.log.debug('Persisting file [%s]', filePath);
                                // TODO check if isFile works to ignore special files
                                try {
                                    await this._fileRepository.persist(new LogicFile(stats.ino, stats.size, filePath));
                                    IndexService.log.debug('File [%s] persisted', filePath);
                                } catch (error) {
                                    IndexService.log.debug('Error persisting file [%s]', filePath, error);
                                    // TODO record failure
                                }
                            }
                            return resolve();
                        });
                    });
                }
                return resolve();
            });
        });
    }
}

export { IndexService }
