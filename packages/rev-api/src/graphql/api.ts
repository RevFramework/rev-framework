import { fields, IModelManager } from 'rev-models';

import { GraphQLSchema, GraphQLObjectType, GraphQLResolveInfo, GraphQLList, FieldNode } from 'graphql';
import { GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean } from 'graphql/type/scalars';
import * as GraphQLJSON from 'graphql-type-json';
import { getMutationConfig } from './mutation/mutation';
import { IModelApiManager } from '../api/types';
import { IGraphQLApi, IGraphQLFieldConverter } from './types';
import { IReadOptions } from 'rev-models/lib/models/types';

export class GraphQLApi implements IGraphQLApi {
    fieldConverters: Array<[new(...args: any[]) => fields.Field, IGraphQLFieldConverter]>;
    modelObjectTypes: { [modelName: string]: GraphQLObjectType } = {};

    constructor(private manager: IModelApiManager) {
        if (!manager || typeof manager.getApiMeta != 'function') {
            throw new Error(`GraphQLApi: Invalid ModelApiManager passed in constructor.`);
        }
        this.fieldConverters = [
            [fields.AutoNumberField, { type: GraphQLInt, converter: (model, fieldName) => model[fieldName] }],
            [fields.IntegerField, { type: GraphQLInt, converter: (model, fieldName) => model[fieldName] }],
            [fields.NumberField, { type: GraphQLFloat, converter: (model, fieldName) => model[fieldName] }],
            [fields.TextField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.BooleanField, { type: GraphQLBoolean, converter: (model, fieldName) => model[fieldName] }],
            [fields.SelectionField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.DateField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.TimeField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
            [fields.DateTimeField, { type: GraphQLString, converter: (model, fieldName) => model[fieldName] }],
        ];
    }

    getApiManager() {
        return this.manager;
    }

    getModelManager(): IModelManager {
        return this.manager.getModelManager();
    }

    getReadableModels(): string[] {
        return Object.keys(this.modelObjectTypes);
    }

    getGraphQLFieldConverter(field: fields.Field) {
        for (const fieldMapping of this.fieldConverters) {
            if (field instanceof fieldMapping[0]) {
                return fieldMapping[1];
            }
        }
    }

    generateModelObject(modelName: string): GraphQLObjectType {
        let meta = this.getModelManager().getModelMeta(modelName);
        return new GraphQLObjectType({
            name: modelName,
            fields: () => {
                const fieldConfig = {};
                meta.fields.forEach((field) => {
                    let scalarType = this.getGraphQLFieldConverter(field);
                    if (scalarType) {
                        fieldConfig[field.name] = {
                            type: scalarType.type,
                            resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                                return scalarType.converter(rootValue, field.name);
                            }
                        };
                    }
                    else if (field instanceof fields.RelatedModelFieldBase) {
                        let modelObjectType = this.modelObjectTypes[field.options.model];
                        if (!modelObjectType) {
                            throw new Error(`GraphQLApi: Model field '${modelName}.${field.name}' is linked to a model '${field.options.model}', which is not registered with the api.`);
                        }
                        if (field instanceof fields.RelatedModelField) {
                            fieldConfig[field.name] = {
                                type: modelObjectType,
                                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                                    return rootValue[field.name];
                                }
                            };
                        }
                        else if (field instanceof fields.RelatedModelListField) {
                            fieldConfig[field.name] = {
                                type: new GraphQLList(modelObjectType),
                                resolve: (rootValue: any, args: any, context: any, info: GraphQLResolveInfo) => {
                                    return rootValue[field.name];
                                }
                            };
                        }
                        else {
                            throw new Error(`GraphQLApi: Unknown relational field type for '${modelName}.${field.name}'`);
                        }
                    }
                    else {
                        throw new Error(`GraphQLApi Error: The field class of ${modelName}.${field.name} does not have a registered mapping.`);
                    }

                });
                return fieldConfig;
            }
        });
    }

    getModelObject(modelName: string): GraphQLObjectType {
        return this.modelObjectTypes[modelName];
    }

    getNoModelsObject(): GraphQLObjectType {
        return new GraphQLObjectType({
            name: 'query',
            fields: { no_models: {
                type: GraphQLString,
                resolve() {
                    return 'No models have been registered for read access';
                }}
            }
        });
    }

    getNodeSelectedSubfields(info: GraphQLResolveInfo): string[] {
        // Extract the list of selected subfields for the current graphql node
        return info.fieldNodes[0].selectionSet.selections.map((selection: FieldNode) => selection.name.value);
    }

    getSchemaQueryObject(): GraphQLObjectType {
        const readableModels = this.getReadableModels();
        if (readableModels.length == 0) {
            return this.getNoModelsObject();
        }
        else {
            const models = this.getModelManager();
            const queryObjectConfig = {
                name: 'query',
                fields: {}
            };
            for (let modelName of readableModels) {
                let modelType = this.getModelObject(modelName);
                queryObjectConfig.fields[modelName] = {
                    type: new GraphQLList(modelType),
                    args: {
                        where: { type: GraphQLJSON }
                    },
                    resolve: (rootValue: any, args?: any, context?: any, info?: GraphQLResolveInfo): Promise<any> => {
                        let modelMeta = models.getModelMeta(modelName);
                        let selectedFields = this.getNodeSelectedSubfields(info);
                        let selectedRelationalFields = selectedFields.filter((fieldName) =>
                            modelMeta.fieldsByName[fieldName] instanceof fields.RelatedModelFieldBase);
                        let readOptions: IReadOptions = {
                            related: selectedRelationalFields
                        };
                        return models.read(modelMeta.ctor, {}, readOptions)
                            .then((res) => {
                                return res.results;
                            });
                    }
                };
            }
            return new GraphQLObjectType(queryObjectConfig);
        }
    }

    getSchema(): GraphQLSchema {

        const readableModels = this.manager.getModelNamesByOperation('read');
        readableModels.forEach((modelName) => {
            this.modelObjectTypes[modelName] = this.generateModelObject(modelName);
        });

        const mutations = getMutationConfig(this.manager);

        return new GraphQLSchema({
            query: this.getSchemaQueryObject(),
            mutation: mutations ? new GraphQLObjectType(mutations) : undefined
        });
    }

}