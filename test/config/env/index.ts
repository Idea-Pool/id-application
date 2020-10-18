import dev from './dev';
import runtime from '../runtime'

export default (env = runtime.env || process.env.ENV) => {
    switch (env.toLowerCase()) {
        case 'dev':
        default:
            return dev;
    }
}