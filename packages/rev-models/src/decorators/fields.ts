import * as fld from '../fields';
import { ITextFieldOptions } from '../fields/textfields';
import { INumberFieldOptions } from '../fields/numberfields';
import { IFieldOptions } from '../fields/field';
import { ISelectFieldOptions } from '../fields/selectionfields';

/* RevModel Field Decorators */

function addFieldMeta(target: any, fieldName: string, fieldObj: fld.Field) {
    if (!target.hasOwnProperty('__fields')) {
        let fields = [];
        if (target.__fields) {
            fields = target.__fields.slice();
        }
        Object.defineProperty(target, '__fields', {
            enumerable: false, value: fields
        });
    }
    target.__fields.push(fieldObj);
}

// Text Fields

export function TextField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TextField(propName, options));
    };
}

export function PasswordField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.PasswordField(propName, options));
    };
}

export function EmailField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.EmailField(propName, options));
    };
}

export function URLField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.URLField(propName, options));
    };
}

// Number Fields

export function NumberField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.NumberField(propName, options));
    };
}

export function IntegerField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.IntegerField(propName, options));
    };
}

export function AutoNumberField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.AutoNumberField(propName, options));
    };
}

// Selection Fields

export function BooleanField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.BooleanField(propName, options));
    };
}

export function SelectField(options: ISelectFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.SelectField(propName, options));
    };
}

export function MultiSelectField(options: ISelectFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.MultiSelectField(propName, options));
    };
}

// Date & Time Fields

export function DateField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateField(propName, options));
    };
}

export function TimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TimeField(propName, options));
    };
}

export function DateTimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateTimeField(propName, options));
    };
}

// Record Fields

export function RelatedModel(options: fld.IRelatedModelFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.RelatedModelField(propName, options));
    };
}

export function RelatedModelList(options: fld.IRelatedModelListFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.RelatedModelListField(propName, options));
    };
}
