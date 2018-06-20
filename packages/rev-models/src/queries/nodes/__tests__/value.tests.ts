import { expect } from 'chai';

import * as d from '../../../decorators';
import { QueryParser } from '../../queryparser';
import { ValueOperator } from '../value';
import { ModelManager } from '../../../models/manager';
import { InMemoryBackend } from '../../../backends/inmemory/backend';

class TestModel {
    @d.IntegerField()
        id: number;
    @d.TextField()
        name: string;
    @d.BooleanField()
        active: boolean;
}

let manager = new ModelManager();
manager.registerBackend('default', new InMemoryBackend());
manager.register(TestModel);
let parser = new QueryParser(manager);

describe('class ValueOperator<T> - constructor', () => {

    it('throws if operator is not a field operator', () => {
        expect(() => {
            new ValueOperator(parser, TestModel, '_and', [], undefined);
        }).to.throw('unrecognised field operator');
    });

    it('throws if value is not a valid field value', () => {
        expect(() => {
            new ValueOperator(parser, TestModel, '_eq', undefined, undefined);
        }).to.throw('invalid field value');
        expect(() => {
            new ValueOperator(parser, TestModel, '_eq', {}, undefined);
        }).to.throw('invalid field value');
    });

    it('stores the operator and value as public properties', () => {
        let node = new ValueOperator(parser, TestModel, '_eq', 12, undefined);
        expect(node.operator).to.equal('eq');
        expect(node.value).to.equal(12);
    });

});
