import { IQueryParser, IQueryNode } from '../types';

import { printObj } from '../../utils/index';
import { IModel } from '../../models/types';

/**
 * @private
 */
export class QueryNode<T extends IModel> implements IQueryNode<T> {
    public children: Array<IQueryNode<T>>;

    constructor(
        public parser: IQueryParser,
        public model: new() => T,
        public operator: string,
        public parent?: IQueryNode<T>) {

        // Nodes should store the operator name without its prefix
        const opName = parser.getUnprefixedOperatorName(operator);
        if (opName) {
            this.operator = opName;
        }

        this.children = [];
    }

    assertIsNonEmptyObject(value: any) {
        if (!value || typeof value != 'object' || Object.keys(value).length == 0) {
            throw new Error(`element ${printObj(value)} is not valid for '${this.operator}'`);
        }
    }

}
