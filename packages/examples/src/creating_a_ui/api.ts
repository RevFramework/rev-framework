
import * as models from './models';
import { createData } from './model_data';
import { ModelManager, InMemoryBackend } from 'rev-models';
import { ModelApiManager } from 'rev-api';

// Register server models

export const modelManager = new ModelManager();
const backend = new InMemoryBackend();
modelManager.registerBackend('default', backend);
modelManager.register(models.User);
modelManager.register(models.Post);
modelManager.register(models.Comment);
modelManager.register(models.ModelWithAllFields);

export const api = new ModelApiManager(modelManager);
api.register(models.User);
api.register(models.Post);
api.register(models.Comment);
api.register(models.ModelWithAllFields);

// Create Koa & Apollo GraphQL Server

import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa';

const schema = api.getGraphQLSchema();

const app = new koa();
const port = 3000;

const router = new koaRouter();
router.post('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphql', graphqlKoa({ schema: schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(async (ctx, next) => {
    const allowedHeaders = ctx.get('Access-Control-Request-Headers');
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', allowedHeaders);
    return next();
});
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);

console.log(`GraphQL Server for UI Demos is running on port ${port}.`);
console.log(`GraphiQL UI is running at http://localhost:${port}/graphiql`);

// Load demo data

createData(modelManager)
.then(() => {
    console.log('Data Loaded. Simulating API Delay of 500ms.');
    backend.OPERATION_DELAY = 500;
})
.catch((e) => {
    console.error('Error loading data', e);
});
