import { expect } from 'chai';
import { IntegerField, TextField, DateField } from '../../fields';

import * as manager from '../manager';
import * as d from '../../decorators';
import { IBackend } from '../../backends/backend';
import { InMemoryBackend } from '../../backends/inmemory/backend';
import { IModelMeta } from '../../models/types';

class TestModel {
    id: number | null;
    name: string;
    date: Date;
}

class TestModel2 {}

class EmptyModel {}

describe('ModelManager', () => {
    let testReg: manager.ModelManager;
    let testMeta: Partial<IModelMeta<TestModel>>;
    let testMeta2: Partial<IModelMeta<TestModel>>;
    let testBackend: IBackend;

    beforeEach(() => {
        testReg = new manager.ModelManager();
        testBackend = {
            create: () => {},
            read: () => {},
            update: () => {},
            remove: () => {}
        } as any;
        testMeta = {
            fields: [
                new IntegerField('id'),
                new TextField('name'),
                new DateField('date')
            ],
            primaryKey: 'id'
        };
        testMeta2 = { fields: [] };
    });

    describe('constructor()', () => {

        it('creates a manager with no models and no backends', () => {
            expect(testReg.getModelNames()).to.have.length(0);
            expect(testReg.getBackendNames()).to.have.length(0);
        });

    });

    describe('isRegistered()', () => {

        beforeEach(() => {
            testReg.registerBackend('default', testBackend);
        });

        it('returns false when a model is not registered', () => {
            expect(testReg.isRegistered('TestModel')).to.equal(false);
        });

        it('returns true when a model is registered', () => {
            testReg.register(TestModel, testMeta);
            expect(testReg.isRegistered('TestModel')).to.equal(true);
        });

        it('returns false when a non-string is passed', () => {
            expect(testReg.isRegistered(22 as any)).to.equal(false);
        });

        it('returns false when an object is passed', () => {
            expect(testReg.isRegistered({test: 1} as any)).to.equal(false);
        });

    });

    describe('register()', () => {

        beforeEach(() => {
            testReg.registerBackend('default', testBackend);
        });

        it('adds a valid model to the manager', () => {
            testReg.register(TestModel, testMeta);
            expect(testReg.getModelMeta('TestModel').ctor).to.equal(TestModel);
        });

        it('adds a decorated model to the manager.', () => {
            class DecoratedModel {
                @d.TextField()
                    name: string;
                @d.IntegerField()
                    age: number;
            }
            testReg.register(DecoratedModel);
            expect(testReg.getModelMeta('DecoratedModel').ctor).to.equal(DecoratedModel);
        });

        it('rejects a non-model constructor with a ModelError', () => {
            expect(() => {
                testReg.register({} as any);
            }).to.throw('ModelError');
        });

        it('should initialise metadata', () => {
            testReg.register(TestModel, testMeta);
            let meta = testReg.getModelMeta('TestModel');
            expect(meta.fieldsByName).to.be.an('object');
        });

        it('throws an error if metadata cannot be initialised', () => {
            expect(() => {
                testReg.register(EmptyModel);
            }).to.throw('MetadataError');
        });

        it('throws an error if model already exists', () => {
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.register(TestModel, testMeta);
            }).to.throw('has already been registered');
        });

    });

    describe('getModelNames()', () => {

        beforeEach(() => {
            testReg.registerBackend('default', testBackend);
        });

        it('should get the names of the models', () => {
            expect(testReg.getModelNames()).to.deep.equal([]);
            testReg.register(TestModel, testMeta);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel']);
            testReg.register(TestModel2, testMeta2);
            expect(testReg.getModelNames()).to.deep.equal(['TestModel', 'TestModel2']);
        });

    });

    describe('getModelMeta()', () => {

        beforeEach(() => {
            testReg.registerBackend('default', testBackend);
        });

        it('should return model metadata containing model constructor', () => {
            testReg.register(TestModel, testMeta);
            let meta = testReg.getModelMeta('TestModel');
            expect(meta.ctor).to.equal(TestModel);
        });

        it('should return model metadata based on model constructor', () => {
            testReg.register(TestModel, testMeta);
            let meta = testReg.getModelMeta(TestModel);
            expect(meta.ctor).to.equal(TestModel);
        });

        it('should return model metadata based on model instance', () => {
            testReg.register(TestModel, testMeta);
            let model = new TestModel();
            model.id = 1;
            model.name = 'Bob';
            let meta = testReg.getModelMeta(model);
            expect(meta.ctor).to.equal(TestModel);
        });

        it('should throw an error if the model does not exist', () => {
            expect(() => {
                testReg.getModelMeta('Flibble');
            }).to.throw('is not registered');
            testReg.register(TestModel, testMeta);
            expect(() => {
                testReg.getModelMeta('Jibble');
            }).to.throw('is not registered');
        });

        it('should throw an error if invalid argument passed', () => {
            expect(() => {
                testReg.getModelMeta(22 as any);
            }).to.throw('Invalid argument');
        });

    });

    describe('getBackendNames()', () => {

        it('returns empty list when no backends are registered', () => {
            expect(testReg.getBackendNames()).to.deep.equal([]);
        });

        it('returns list when a backend is registered', () => {
            testReg.registerBackend('default', testBackend);
            expect(testReg.getBackendNames()).to.deep.equal(['default']);
        });

        it('returns list when multiple backends are registered', () => {
            testReg.registerBackend('default', testBackend);
            testReg.registerBackend('fancy_db', testBackend);
            expect(testReg.getBackendNames()).to.deep.equal(['default', 'fancy_db']);
        });

    });

    describe('registerBackend()', () => {

        it('successfully configures the default backend', () => {
            testReg.registerBackend('default', testBackend);
            expect(testReg.getBackend('default')).to.equal(testBackend);
        });

        it('successfully configures a new valid backend', () => {
            testReg.registerBackend('my_db', testBackend);
            expect(testReg.getBackend('my_db')).to.equal(testBackend);
        });

        it('successfully configured an InMemory backend', () => {
            let backend = new InMemoryBackend();
            testReg.registerBackend('default', backend);
            expect(testReg.getBackend('default')).to.equal(backend);
        });

        it('throws an error when backendName is not specified', () => {
            expect(() => {
                testReg.registerBackend(undefined as any, undefined as any);
            }).to.throw('you must specify a name');
        });

        it('throws an error when backend is not an object', () => {
            expect(() => {
                testReg.registerBackend('my_backend', (() => {}) as any);
            }).to.throw('you must pass an instance of a backend class');
        });

        it('throws an error when backend is missing one or more methods', () => {
            expect(() => {
                testReg.registerBackend('my_backend', {} as any);
            }).to.throw('the specified backend does not fully implement the IBackend interface');
        });

    });

    describe('getBackend()', () => {

        it('gets a backend', () => {
            testReg.registerBackend('my_db', testBackend);
            expect(testReg.getBackend('my_db')).to.equal(testBackend);
        });

        it('throws an error if backendName not specified', () => {
            expect(() => {
                testReg.getBackend(undefined as any);
            }).to.throw('you must specify the name of the backend to get');
        });

        it('throws an error if backendName has not been configured', () => {
            expect(() => {
                testReg.getBackend('non-configured-backend');
            }).to.throw('has has not been configured');
        });

    });

    describe('isNew()', () => {

        beforeEach(() => {
            testReg.registerBackend('default', testBackend);
            testReg.register(TestModel, testMeta);
            testReg.register(TestModel2, testMeta2);
        });

        it('throws if specified model is undefined', () => {
            expect(() => {
                testReg.isNew(undefined as any);
            }).to.throw('Specified model is not a Model instance');
        });

        it('throws if specified model is null', () => {
            expect(() => {
                testReg.isNew(null as any);
            }).to.throw('Specified model is not a Model instance');
        });

        it('throws if specified model does not have a primaryKey field', () => {
            const model = new TestModel2();
            expect(() => {
                testReg.isNew(model);
            }).to.throw('isNew() can only be used with models that have a primaryKey field');
        });

        it('returns true if the primaryKey field is undefined', () => {
            const model = new TestModel();
            expect(testReg.isNew(model)).to.be.true;
        });

        it('returns true if the primaryKey field is null', () => {
            const model = new TestModel();
            model.id = null;
            expect(testReg.isNew(model)).to.be.true;
        });

        it('returns false if the primaryKey field for a model has a value', () => {
            const model = new TestModel();
            model.id = 0;
            expect(testReg.isNew(model)).to.be.false;
        });

    });

    describe('model CRUD functions', () => {  // TODO

        it('contains create() function', () => {
            expect(testReg.create).to.be.a('function');
        });

        it('contains update() function', () => {
            expect(testReg.update).to.be.a('function');
        });

        it('contains remove() function', () => {
            expect(testReg.remove).to.be.a('function');
        });

        it('contains read() function', () => {
            expect(testReg.read).to.be.a('function');
        });

        it('contains exec() function', () => {
            expect(testReg.exec).to.be.a('function');
        });

        it('contains validate() function', () => {
            expect(testReg.validate).to.be.a('function');
        });

        it('contains hydrate() function', () => {
            expect(testReg.hydrate).to.be.a('function');
        });

    });

});
