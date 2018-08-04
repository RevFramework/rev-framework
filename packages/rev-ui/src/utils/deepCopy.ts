import { IObject } from 'rev-models/lib/utils/types';

/**
 * @private
 */
export function deepCopy(obj: IObject) {
    const clone: IObject = {};
    for (let key in obj) {
        if (obj[key] != null && typeof(obj[key]) == 'object') {
            clone[key] = deepCopy(obj[key]);
        }
        else {
            clone[key] = obj[key];
        }
    }
    return clone;
}
