import { Router } from "express";
import {GuestRecord} from "../records/guest.record";
import { ValidationError } from "../utils/errors";
import {cookieName, dateOfBirthday} from "../utils/variables";
import {createFileWithBirthdayData, dateToString} from "../utils/functions";
import {unlink} from "fs/promises";

export const homeRouter = Router();

homeRouter
    .get('/add-guest', async (req, res)=>{
        //Tutaj wypadałby zrobić walidację, czy gość nie jest już na liście gości (nie ma ciasteczka)- jednak
        //, gdy gość wpisze dane innego gościa, to zaloguje się na jego miejsce i u niego pojawi się opcja zmiany
        // ciasteczko się nadpisuje
        res.render('add/guest');
    })
    .get('/download-guest-list', async (req, res)=>{
        //@TODO usunąć plik po pobraniu
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        if (idFromCookie) {
            const path = await createFileWithBirthdayData(idFromCookie);

            res
                .download(path, async (err) => {
                if (err){
                 console.error(err);
                 await unlink(path);
                } else {
                 await unlink(path);
                }
            })
        } else {
            throw new ValidationError('Zaloguj się zanim spróbujesz pobrać listę gości');
        }
})
    .get('/', async (req, res)=>{
        const fullList = await GuestRecord.listAll();
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;
        const resignationTimeStampString = await dateToString(dateOfBirthday);

        if (fullList.length === 0){
            res.redirect('/add-guest');
            return;
        }

        res.render('home/home', {
            fullList,
            loggedUser,
            resignationTimeStampString,
        });
    })
    .get('/my-choice', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        if (!idFromCookie){
            throw new ValidationError('Niestety nie jesteś zalogowany jako gośc. Dodaj siebie klikając przycisk "Dodaj Gościa" w menu górnym.');
        }
        const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;
        const visitingGuest = await GuestRecord.getOne(idFromCookie);

        res.render('change/choice', {
            visitingGuest,
            loggedUser,
        });
    })
    .get('/absent', async (req, res)=>{
        const fullList = await GuestRecord.listAllAbsent();
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;
        const message= ', którzy nie przyjdą.';
        const resignationTimeStampString = await dateToString(dateOfBirthday);

        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście gości nieobecnych');
        }

        res.render('home/home', {
            fullList,
            message,
            loggedUser,
            resignationTimeStampString,
        });
    })
    .get('/present', async (req, res)=>{
        const fullList = await GuestRecord.listAllPresent();
        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście gości, którzy chcą przyjść.');
        }

        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const message = ', którzy przyjdą.';
        const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;

        res.render('home/home', {
            fullList,
            loggedUser,
            message,
        });
    })
    .get('/resigned', async (req, res)=>{
        const fullList = await GuestRecord.listAllThatResigned();
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const message = ', którzy zrezygnowali.';

        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście, gości, którzy zrezygnowali.');
        }
        const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;
        const resignationTimeStampString = await dateToString(dateOfBirthday);

        res.render('home/home', {
            fullList,
            loggedUser,
            message,
            resignationTimeStampString,
        });
    })
    .post('/', async (req, res)=>{
        const name: string = req.body.name;
        const lastName: string = req.body.lastName;
        const foundByName = await GuestRecord.findByNameAndLastName(name, lastName) ?? null;

        if (foundByName) {
            const {id} = await GuestRecord.getOne(foundByName);

            if (id) {
                res
                    .cookie(cookieName, id, {
                        expires: dateOfBirthday,
                        httpOnly: true,
                        secure: true,
                    })
                    .redirect('/');
            } else {
                throw new ValidationError('Coś poszło nie tak, spróbuj ponownie.')
            }
        } else {

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
        }
    })
    .patch('/my-choice', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;

        const clickedTask = new GuestRecord(await GuestRecord.getOne(idFromCookie));
        await clickedTask.setAbsentPresent();//@TODO tutaj dodać validację czasu rezygnacji

        res.redirect('/my-choice');
    })
    .delete('/:id', async (req, res)=>{
        const {id} = req.params; //W zadaniu nie ma potrzeby walidacji, dlatego jej nie ma, ale by się prosiło
        const clickedTask = new GuestRecord(await GuestRecord.getOne(id));
        await clickedTask.delete();

        res
            .clearCookie(cookieName)
            .redirect('/');
    })