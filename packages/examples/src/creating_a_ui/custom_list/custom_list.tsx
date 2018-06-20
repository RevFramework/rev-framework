import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, ListView, IListViewComponentProps } from 'rev-ui';
import * as models from '../models';

import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';

import { registerComponents } from 'rev-ui-materialui';
import { getColour } from '../utils';
registerComponents();

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new ModelApiBackend('http://localhost:3000/graphql'));
modelManager.register(models.User);
modelManager.register(models.Post);
modelManager.register(models.Comment);

// Custom ListView Component

const MyCustomListView = (props: IListViewComponentProps<models.Post>) => {

    if (props.loadState == 'LOADING') {
        // Loading State
        return (
            <Typography variant="subheading">
                Loading...
            </Typography>
        );
    }
    else {
        // Loaded State
        const postCards = props.results.map((post) => (
            <Grid item xs={12} md={6}>
                <Card style={{ height: '100%' }}>
                    <CardHeader
                        avatar={
                            <Avatar style={{ backgroundColor: getColour() }}>
                                {post.title.substr(0, 1)}
                            </Avatar>
                        }
                        title={post.title}
                        subheader={post.post_date}
                    />
                    <CardContent>
                        <Typography component="p">
                            {post.body}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        ));

        return (
            <div>
                <Typography variant="title" style={{ paddingBottom: 30 }}>
                    {props.title}
                </Typography>
                <Grid container spacing={40}>
                    {postCards}
                </Grid>
            </div>
        );
    }
};

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        RevJS - Custom List Demo
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ maxWidth: 800, margin: '30px auto' }}>
                <ListView
                    title="Current Posts"
                    model="Post"
                    where={{
                        post_date: { _gt: '2017-01-01' }
                    }}
                    orderBy={['post_date desc']}
                    limit={5}
                    component={MyCustomListView}
                />
            </div>

        </ModelProvider>
    ),
    document.getElementById('app')
);
