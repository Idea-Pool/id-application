import dev from './dev';
import local from './local';
import runtime from '../runtime'

export default (env = runtime.env || process.env.ENV) => {
    switch (env.toLowerCase()) {
        case 'dev':
            return dev;
        case 'local':
        default:
            return local;
    }
}