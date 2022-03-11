import { Router } from "express";
import {GuestRecord} from "../records/guest.record";
import { ValidationError } from "../utils/errors";
import {cookieName, dateOfBirthday} from "../utils/variables";
import {createFileWithBirthdayData, getDataToRenderList} from "../utils/functions";
import {unlink} from "fs/promises";

export const homeRouter = Router();

homeRouter
    //render form add/log guest
    .get('/add-guest', async (req, res)=>{
        res.render('add/guest');
    })
    //method GET and rendering site before and after changing status (willCome variable) in method Patch that responds with redirect to this page
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
    //render "Wszyscy" menu option
    .get('/', async (req, res)=>{
        const fullList = await GuestRecord.listAll();
        //if list is empty redirect to add user page
        if (fullList.length === 0){
            res.redirect('/add-guest');
            return;
        }
        //Get data to render the Page
        const { loggedUser, resignationTimeStampString } = await getDataToRenderList(req.cookies.guestOnBirthday);

        //if the list is not empty render list
        res.render('home/home', {
            fullList,
            loggedUser,
            resignationTimeStampString,
        });
    })
    //render "Nieobecni" page
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
    //Render "Obecni" Page
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
    //Render "Zrezygnowali" page
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
    //Create and download html file with guest list
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
    //Method POST add/log user in "Dodaj gościa" page
    .post('/', async (req, res)=>{
        const name: string = req.body.name;
        const lastName: string = req.body.lastName;
        //Find record of guest by name and lastName
        const foundByName = await GuestRecord.findByNameAndLastName(name, lastName) ?? null;

        //If guest record is not empty log guest
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
            //if guest record doesn't exist store new record
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
    //change status (willCome variable) of absention of logged user
    .patch('/my-choice', async (req, res)=>{
        const idFromCookie = req.cookies.guestOnBirthday ? req.cookies.guestOnBirthday : null;
        const clickedTask = new GuestRecord(await GuestRecord.getOne(idFromCookie));
        //this is where status (willCome variable) is changed
        await clickedTask.setAbsentPresent();

        res.redirect('/my-choice');
    })
    //Deletion of Guest Record
    .delete('/:id', async (req, res)=>{
        const {id} = req.params; //W zadaniu nie ma potrzeby walidacji, dlatego jej nie ma, ale by się prosiło
        const clickedTask = new GuestRecord(await GuestRecord.getOne(id));
        await clickedTask.delete();

        res
            .clearCookie(cookieName)
            .redirect('/');
    })