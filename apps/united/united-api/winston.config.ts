/*
* http://usejsdoc.org/
*/

import * as winston from 'winston';

winston.configure({ level: 'debug', transports: [new ( winston.transports.Console )()] });
