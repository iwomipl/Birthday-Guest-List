import { Router } from "express";
import {GuestRecord} from "../records/guest.record";
import { ValidationError } from "../utils/errors";
import {cookieName, dateOfBirthday} from "../utils/variables";

let message: string;

export const homeRouter = Router();

homeRouter
    .get('/add-guest', async (req, res)=>{
        // if (req.cookies.guestOnBirthday > 0){
        //     res.render('add/guest');
        // } else {
        //     throw new ValidationError('Przepraszamy nie można dodać więcej, niż jednego gościa.');
        // }
        res.render('add/guest');
})
    .get('/', async (req, res)=>{
        const fullList = await GuestRecord.listAll();
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        message = message ?? null;

        if (fullList.length === 0){
            res.redirect('/add-guest');
            return;
        }

        res.render('home/home', {
            fullList,
            idFromCookie,
            message,
        });
    })
    .post('/', async (req, res)=>{
        const name: string = req.body.name;
        const lastName: string = req.body.lastName;
        if (await GuestRecord.isNameTaken(name, lastName)) {
            throw new ValidationError(`Nie możemy cię dodać do listy gości. Gość o takim imieniu i nazwisku już istnieje. Jakie są na to szanse, żeby na imprezie urodzinowej pojawiły się dwie osoby o takich samych imionach i nazwiskach? :)`);
        }

        const newGuest = new GuestRecord({
            name: name,
            lastName: lastName,
            willCome: 0,
        });

        const id = await newGuest.insert();

        res
            .cookie(cookieName, id, {
                expires: dateOfBirthday,
                httpOnly: true,
                secure: true,
            })
            .redirect('/');
    })
    .patch('/:id', async (req, res)=>{
        const {id} = req.params;//@TODO tutaj źle, trzeba zrobić metodę do GuesrRecord po Name i lastName, które są i tak widoczne

        const clickedTask = new GuestRecord(await GuestRecord.getOne(id));
        await clickedTask.setAbsentPresent(); //@TODO tutaj dodać validację czasu rezygnacji

        res.redirect('/');
    })
    .delete('/:id', async (req, res)=>{
        const {id} = req.params; //@TODO tutaj źle, trzeba zrobić metodę do GuesrRecord po Name i lastName, które są i tak widoczne
        const clickedTask = new GuestRecord(await GuestRecord.getOne(id));
        message = await clickedTask.delete(); //@TODO tutaj dodać validację czasu rezygnacji

        res
            .clearCookie(cookieName)//@TODO sprawdzić, czy działa
            .redirect('/');
        return;
    })