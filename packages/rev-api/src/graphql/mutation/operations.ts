import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLInt } from 'graphql';
import { IApiMeta, IModelApiManager } from '../../api/types';
import * as GraphQLJSON from 'graphql-type-json';

export function getModelOperationMutations(manager: IModelApiManager, meta: IApiMeta): GraphQLFieldConfigMap<any, any> {
    let fields = {};

    for (let operationName of meta.operations) {
        if (operationName != 'read') {
            let mutationName = meta.model + '_' + operationName;
            fields[mutationName] = {
                type: GraphQLJSON,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLInt) }
                },
                resolve: (root: any, args: any, context: any, info: any) => {
                    return {
                        success: true
                    };
                }
            };
        }
    }

    return fields;
}