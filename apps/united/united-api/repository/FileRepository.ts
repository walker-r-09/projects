/*
* http://usejsdoc.org/
*/

import { LogicFile } from '../entity/File';

interface FileRepository {
    persist(file: LogicFile): void;
}

class MongoDBFileRepository implements FileRepository {
    
    async persist(file: LogicFile): Promise<void> {
        
        // FIXME continue here!!!
        return new Promise<void>((resolve, reject) => {
            return resolve();
        });
    }
}

export { FileRepository, MongoDBFileRepository }
