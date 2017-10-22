
import { IModelOperationResult, ModelOperationResult, ModelManager } from 'rev-models';
import { ModelApiManager } from '../../api/manager';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { IApiMethodMeta } from '../../api/meta';
import { IModelOperation } from 'rev-models/lib/operations/operation';

export function getMethodResolver(manager: ModelApiManager, modelName: string, methodName: string) {
    let models = manager.modelManager;
    let meta = manager.getApiMeta(modelName);
    let modelMeta = models.getModelMeta(modelName);
    let methodMeta = meta.methods[methodName];

    return (value: any, args: any): Promise<IModelOperationResult<any, any>> => {

        let modelData = args ? args.model : undefined;
        let instance = models.hydrate(modelMeta.ctor, modelData);

        return validateMethodArgs(models, methodMeta, args)
        .then((res) => {
            if (!res.valid) {
                let result = new ModelOperationResult({
                    operation: methodName
                });
                result.createValidationError(res);
                return result;
            }
            else {
                let execArgs = getMethodExecArgs(methodMeta, args);
                return models.exec(instance, methodName, execArgs);
            }
        });
    };
}

function getMethodExecArgs(meta: IApiMethodMeta, args: any) {
    let argsModel = {};
    if (meta.args) {
        for (let field of meta.args) {
            argsModel[field.name] = args[field.name];
        }
    }
    return argsModel;
}

function validateMethodArgs(models: ModelManager, methodMeta: IApiMethodMeta, args: any): Promise<ModelValidationResult> {

    let promises: Array<Promise<any>> = [];
    let result = new ModelValidationResult();

    if (methodMeta.args) {
        let operation: IModelOperation = {
            operation: 'validateArgs'
        };
        for (let field of methodMeta.args) {
            promises.push(field.validate(models, args, operation, result));
        }
    }

    if (promises.length) {
        return Promise.all(promises)
            .then(() => {
                return result;
            });
    }
    else {
        return Promise.resolve(result);
    }

}