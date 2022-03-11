import { normalize, resolve, dirname } from "path";
import {writeFile, appendFile} from "fs/promises";
import {dateOfBirthday, locationOfBirthday, timeBeforeBirthdayToResignInMiliseconds} from "./variables";
import {GuestRecord} from "../records/guest.record";

//validate if action is happening in right time (not 5 hours before birthday)
export async function validateTimeOfResigning(): Promise<boolean>{
    return ((dateOfBirthday.getTime() - new Date().getTime()) >= timeBeforeBirthdayToResignInMiliseconds);
}

//creation of safe patho to file, this function unables getting out of project folder
export async function safeJoin(base: string, target: string): Promise<string> {
    const targetPath = `.${normalize(`/${target}`)}`;
    return resolve(base, targetPath);
}

//function cutting of some part of string from Object Date, afterward it sends string
export async function dateToString(sentDate: Date): Promise<string>{
    return `${new Date(sentDate).toISOString().slice(0, 10)}  ${new Date(sentDate).toISOString().slice(11, 19)}`;
}

//Creates HTML file, that is sent to Guest. Function returns path to the newly created file
export async function createFileWithBirthdayData(id: string): Promise<string>{
    const pathToFile = await safeJoin(dirname(__dirname), `/public/files/${id}.html`);
    const guest =  await GuestRecord.getOne(id);
    const guestList = await GuestRecord.listAllPresent();
    const str = await createHeadOfBody(guest);
    const header = await createHeader(locationOfBirthday, await dateToString(dateOfBirthday));
    const listOfGuests = await createTableOfGuests(guestList);

    await writeFile(pathToFile, header, 'utf8');

    await appendFile(pathToFile, str, 'utf8');
    await appendFile(pathToFile, listOfGuests, 'utf8');

    return pathToFile;
}

//Creating top parto of HTML file
async function createHeader(location: string, time: string): Promise<string>{
    return (`
<p>Zapraszam na moją imprezę urodzinową.</p>
<p>Odbędzie sie ona w <strong>${location}</strong>.</p>
<p>W terminie <strong>${time}</strong>.</p>
`);
}

//creating next part of file from Guest object
async function createHeadOfBody(obj: GuestRecord): Promise<string>{
    return `<p>Potwierdzenie przygotowano dla <strong>${obj.name} ${obj.lastName}</strong></p>`;
}

//creating body of HTML file by iterating thru sent list of records of Guests
async function createTableOfGuests(listOfGuests: GuestRecord[]){
    if (listOfGuests.length === 0) {
        return `<h1>Bardzo mi przykro, nikt nie przyjdzie.</h1>`
    }
    const tableHeader = (`
        <table>
            <theader>
                <tr>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                </tr>
            </theader> 
            <tbody>  
    `);
    const tableContent = listOfGuests.map(guest => {333
        return (`
            <tr>
            <td>${guest.name}</td>
            <td>${guest.lastName}</td>
            </tr>`);
    })
    const tableFinish = (`</tbody></table>`);

    return tableHeader+tableContent.join('')+tableFinish;
}

//Function used multiple times before rendering pages. Creating it makes homeRouter code easier to read
export async function getDataToRenderList(id: string, sentMessage?: string){
    const idFromCookie: string | null = id ? id : null;
    const loggedUser = await GuestRecord.getOne(idFromCookie) ?? null;
    const resignationTimeStampString = await dateToString(dateOfBirthday);
    const message = sentMessage;

    return {
        loggedUser,
        resignationTimeStampString,
        message,
    }
}
