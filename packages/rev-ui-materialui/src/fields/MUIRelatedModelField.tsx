
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { withModelManager, IModelManagerProp } from 'rev-ui';
import { getGridWidthProps } from './utils';
import { IRelatedModelFieldOptions } from 'rev-models/lib/fields';
import { IModel, IModelMeta } from 'rev-models';

export interface IMUIRelatedModelFieldState {
    loadState: 'NONE' | 'LOADING';
    selection: IModel[] | null;
}

class MUIRelatedModelFieldC extends React.Component<IFieldComponentProps & IModelManagerProp, IMUIRelatedModelFieldState> {

    modelMeta: IModelMeta<any>;

    constructor(props: IFieldComponentProps & IModelManagerProp) {
        super(props);

        const opts: IRelatedModelFieldOptions = this.props.field.options;

        this.modelMeta = this.props.modelManager.getModelMeta(opts.model);

        this.state = {
            loadState: 'LOADING',
            selection: null
        };

        // TODO: dynamic selection-options should be cacheable,
        // so they don't have to be queried for every component.
        this.loadSelection();
    }

    async loadSelection() {
        const res = await this.props.modelManager.read(this.modelMeta.ctor, { where: {} });
        this.setState({
            loadState: 'NONE',
            selection: res.results || null
        });
    }

    onSelectionChange(primaryKey: any) {
        if (primaryKey === null) {
            this.props.onChange(null);
        }
        else if (this.state.selection) {
            const match = this.state.selection.find(
                (model) => model[this.modelMeta.primaryKey!] == primaryKey
            );
            if (match) {
                this.props.onChange(match);
            }
        }
    }

    render() {

        const gridWidthProps = getGridWidthProps(this.props);
        const fieldId = this.props.field.name;

        let error = this.props.errors.length > 0;
        let errorText = '';
        this.props.errors.forEach((err) => {
            errorText += err.message + '. ';
        });

        let disabled = this.props.disabled;
        const selection: Array<[string, string]> = [['', '']];

        if (this.state.loadState == 'LOADING' || !this.state.selection) {
            disabled = true;
        }
        else {
            this.state.selection.forEach((model) => {
                selection.push([model[this.modelMeta.primaryKey!].toString(), model.toString()]);
            });
        }

        const value = (this.props.value && this.props.value[this.modelMeta.primaryKey!].toString()) || '';

        return (
            <Grid item {...gridWidthProps} style={this.props.style}>

                <FormControl fullWidth>
                    <InputLabel
                        htmlFor={fieldId}
                        error={error}
                    >
                        {this.props.label}
                    </InputLabel>
                    <Select
                        value={value}
                        onChange={(event) => this.onSelectionChange(event.target.value)}
                        inputProps={{
                            id: fieldId
                        }}
                        error={error}
                        disabled={disabled}
                    >
                        {selection.map(([code, text], index) => (
                            <MenuItem key={index} value={code}>{text}</MenuItem>
                        ))}
                    </Select>
                    {errorText &&
                        <FormHelperText error>
                            {errorText}
                        </FormHelperText>}
                </FormControl>

            </Grid>
        );
    }
}

export const MUIRelatedModelField = withModelManager(MUIRelatedModelFieldC);
