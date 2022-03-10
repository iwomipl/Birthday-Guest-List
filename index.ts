import * as express from 'express';
import 'express-async-errors';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import {static as eStatic, urlencoded} from "express";
import {engine} from "express-handlebars";
import { homeRouter } from './routers/home';
import {handleError, handleFourOhFourError} from './utils/errors';
import {handlebarsHelpers} from "./utils/handlebars-helpers";

const app = express();

app.use(methodOverride('_method'));
app.use(urlencoded({
    extended: true,
}));
app.use(eStatic('public'));
app.use(cookieParser());
app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: handlebarsHelpers,
}));
app.set('view engine', '.hbs');

app.use('/', homeRouter);

app.use(handleError);
app.use(handleFourOhFourError);

app.listen(3000, 'localhost', ()=>{
    console.log('listening on http://localhost:3000');
});