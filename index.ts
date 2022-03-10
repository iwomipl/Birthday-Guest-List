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
const port = Number(process.env.PORT) || 3000;
const host = 'localhost';


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
//błąd do obsługi 404
app.use(handleFourOhFourError);

app.listen(port, host, ()=>{
    console.log(`listening on http://${host}:${port}`);
});