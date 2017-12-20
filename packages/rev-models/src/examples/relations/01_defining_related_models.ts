
import * as rev from '../../index';
import { models } from '../01_defining_a_model_manager';

export class BaseModel<T> {
    constructor(data?: Partial<T>) {
        Object.assign(this, data);
    }
}

export class Company extends BaseModel<Company> {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField()
        name: string;

}

export class Developer extends BaseModel<Developer> {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField({label: 'Name'})
        name: string;
    @rev.RecordListField({ model: 'Job' })
        jobs: Job[];

}

export class Job extends BaseModel<Job> {

    @rev.RecordField({ model: 'Developer' })
        developer: Developer;
    @rev.RecordField({ model: 'Company' })
        company: Company;
    @rev.TextField()
        job_title: string;
    @rev.DateField()
        date: string;

}

models.register(Company);
models.register(Developer);
models.register(Job);