import express from 'express';
import path from 'path';

import morgan from 'morgan';
import bodyParser from 'body-parser';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import mongoose from 'mongoose';
import session from 'express-session';

import api from './routes';

const app = express();

const port = 3000;
const devPort = 4000;


app.use(morgan('dev'));
app.use(bodyParser.json());

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log("connected to mogodb server");
});
mongoose.connect('mongodb://localhost/codelab');

app.use(session({
    secret : 'CodeLab1$1$234',
    resave : false,
    saveUninitialized : true
}))

app.use('/api', api);

app.use('/', express.static(path.join(__dirname, './../public')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './../public/index.html'));
});

app.get('/hello', (req, res) => {
    return res.send("Hello Codelab");
});



app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(port, () => {
    console.log("Express is listening port", port);
});

if(process.env.NODE_ENV == 'development'){
    console.log("Server is running development mode");
    const config = require('../webpack.dev.config');
    const compiler = webpack(config);
    const devSever = new WebpackDevServer(compiler, config.devServer);

    devSever.listen(devPort, () => {
        console.log("Webpack-dev-server is listening on port", devPort);
    });
}
