
import { IndexService } from '../service/IndexService';
import { MongoDBFileRepository } from '../repository/FileRepository';
//import container from '../inversify.config';

import * as fs from 'fs';
import * as platformPath from 'path';
import * as winston from 'winston';

//let config = require('../assets/config/config');

async function mkdir(directory: string, root?: string): Promise<void> {
    
    return new Promise<void>((resolve, reject) => {
        
        winston.debug('Directory is [%s]', directory);
        let dirParts = directory.split(/[\/\\]/);
        if (root == null) {
            winston.debug('Root param not passed');
            if (platformPath.isAbsolute(directory)) {
                root = dirParts[0];
                dirParts.splice(0, 1);
            } else {
                root = '.';
            }
        }
        
        winston.debug('Root is [%s]', root);
        if (directory) {
            
            winston.debug('We have dir parts to process');
            let currentDir = root + platformPath.sep + dirParts[0];
            // Prepare next dir to be created
            dirParts.splice(0, 1);
            fs.stat(currentDir, async (err, stats) => {
                if (err) {
                    winston.debug('Parent dir [%s] doesn\'t exist', currentDir);
                    fs.mkdir(currentDir, async err => {
                        if (err) {
                            winston.debug('Error creating it', err);
                            return reject(err);
                        } else {
                            winston.debug('Created');
                            try {
                                await mkdir(dirParts.join(platformPath.sep), currentDir);
                                return resolve();
                            } catch (error) {
                                return reject(error);
                            }
                        }
                    });
                } else {
                    winston.debug('Parent dir [%s] already exists', currentDir);
                    try {
                        await mkdir(dirParts.join(platformPath.sep), currentDir);
                        return resolve();
                    } catch (error) {
                        return reject(error);
                    }
                }
            });
        } else {
            winston.debug('Finished creating directories');
            return resolve();
        }
    });
}

describe("IndexService", function() {
    
    let tmpDirectory = './tmp/testdir';
    let rootDir = '.';
    
    beforeAll(async done => {
        try {
            winston.info('Creating directory [%s]', tmpDirectory);
            await mkdir(tmpDirectory);
            let filePromises = new Array<Promise<void>>();
            winston.info('Iterating files');
            for (let file of ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt']) {
                winston.info('Creating file [%s]', file);
                filePromises.push(new Promise<void>((resolve, reject) => {
                    fs.writeFile(tmpDirectory + platformPath.sep + file, 'Contents of file ' + file, (err) => {
                        if (err) {
                            winston.error('Error creating file [%s]', file, err);
                        }
                        winston.info('File [%s] created', file);
                        resolve();
                    });
                }));
            }
            Promise.all(filePromises).then(done).catch(done);
        } catch (error) {
            winston.error('Error creating directory [%s]', tmpDirectory);
            done.fail(error);
        }
    });
    
    it('Should index directory successfully', async done => {

        try {
            let indexService: IndexService = new IndexService(new MongoDBFileRepository());
            await indexService.index(tmpDirectory);
        } catch (error) {
            done.fail(error);
        }
        done();
    });
});
