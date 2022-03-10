import { Router } from "express";
import {GuestRecord} from "../records/guest.record";
import { ValidationError } from "../utils/errors";
import {cookieName, dateOfBirthday} from "../utils/variables";
import {createFileWithBirthdayData, getDataToRenderList} from "../utils/functions";
import {unlink} from "fs/promises";

export const homeRouter = Router();

homeRouter
    //renderowanie formularza dodania gościa/ zalogowania
    .get('/add-guest', async (req, res)=>{
        res.render('add/guest');
    })
    //metoda GET i renderowanie strony przed i po zmianie w metodzie PATCH kończącą sie redirectem
    .get('/my-choice', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        if (!idFromCookie){
            throw new ValidationError('Niestety nie jesteś zalogowany jako gośc. Dodaj siebie klikając przycisk "Dodaj Gościa" w menu górnym.');
        }
        const { loggedUser, resignationTimeStampString } = await getDataToRenderList(req.cookies.guestOnBirthday);
        const visitingGuest = await GuestRecord.getOne(idFromCookie);

        res.render('change/choice', {
            visitingGuest,
            loggedUser,
            resignationTimeStampString,
        });
    })
    //Renderowanie strony głównej
    .get('/', async (req, res)=>{
        const fullList = await GuestRecord.listAll();
        //jeśli lista gości jest pusta, przekierowanie do dodania gościa
        if (fullList.length === 0){
            res.redirect('/add-guest');
            return;
        }
        //Pobieranie danych do renderowania
        const { loggedUser, resignationTimeStampString } = await getDataToRenderList(req.cookies.guestOnBirthday);

        //w innym przypadku renderujemy listę
        res.render('home/home', {
            fullList,
            loggedUser,
            resignationTimeStampString,
        });
    })
    //Renderowanie listy nieobecnych
    .get('/absent', async (req, res)=>{
        const fullList = await GuestRecord.listAllAbsent();
        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście gości nieobecnych');
        }
        const { loggedUser, resignationTimeStampString, message } = await getDataToRenderList(req.cookies.guestOnBirthday, ', którzy nie przyjdą.');


        res.render('home/home', {
            fullList,
            message,
            loggedUser,
            resignationTimeStampString,
        });
    })
    //Renderowanie listy obecnych
    .get('/present', async (req, res)=>{
        const fullList = await GuestRecord.listAllPresent();
        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście gości, którzy chcą przyjść.');
        }
        const { loggedUser, message } = await getDataToRenderList(req.cookies.guestOnBirthday, ', którzy przyjdą.');

        res.render('home/home', {
            fullList,
            loggedUser,
            message,
        });
    })
    //Renderowanie listy osób, które zrezygnowały
    .get('/resigned', async (req, res)=>{
        const fullList = await GuestRecord.listAllThatResigned();
        if (fullList.length === 0){
            throw new ValidationError('Niestety, nikogo nie ma na liście, gości, którzy zrezygnowali.');
        }
        const { loggedUser, message, resignationTimeStampString } = await getDataToRenderList(req.cookies.guestOnBirthday, ', którzy zrezygnowali.');


        res.render('home/home', {
            fullList,
            loggedUser,
            message,
            resignationTimeStampString,
        });
    })
    //Pobranie wygenerowanego pliku
    .get('/download-guest-list', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        if (idFromCookie) {
            //stworzenie pliku
            const path = await createFileWithBirthdayData(idFromCookie);

            res.download(path, async (err) => {
                    if (err){
                        console.error(err);
                        await unlink(path);
                    } else {
                        //usunięcie pliku po wysłaniu
                        await unlink(path);
                    }
                })
        } else {
            throw new ValidationError('Zaloguj się zanim spróbujesz pobrać listę gości');
        }
    })
    //Utworzenie/zalogowanie gościa
    .post('/', async (req, res)=>{
        const name: string = req.body.name;
        const lastName: string = req.body.lastName;
        //odnalezienie gościa po imieniu
        const foundByName = await GuestRecord.findByNameAndLastName(name, lastName) ?? null;

        //Jeśli gość istnieje logujemy jego
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
            //jeśli gość o powyższych danych nie istnieje, dodajemy nowego do Bazy Danych
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
    //Zmiana statusu zalogowanego użytkownika
    .patch('/my-choice', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const clickedTask = new GuestRecord(await GuestRecord.getOne(idFromCookie));
        //ta funkcja zmienia status użytkownika
        await clickedTask.setAbsentPresent();

        res.redirect('/my-choice');
    })
    //Usuwanie użytkownika
    .delete('/:id', async (req, res)=>{
        const {id} = req.params; //W zadaniu nie ma potrzeby walidacji, dlatego jej nie ma, ale by się prosiło
        const clickedTask = new GuestRecord(await GuestRecord.getOne(id));
        await clickedTask.delete();

        res
            .clearCookie(cookieName)
            .redirect('/');
    })