import { normalize, resolve, dirname } from "path";
import {writeFile, appendFile} from "fs/promises";

import {dateOfBirthday, locationOfBirthday, timeBeforeBirthdayToResignInMiliseconds} from "./variables";
import {GuestRecord} from "../records/guest.record";


export async function validateTimeOfResigning(): Promise<boolean | null>{
    return ((dateOfBirthday.getTime() - new Date().getTime()) >= timeBeforeBirthdayToResignInMiliseconds);
}

export async function safeJoin(base: string, target: string): Promise<string> {
    const targetPath = `.${normalize(`/${target}`)}`;
    return resolve(base, targetPath);
}

export async function dateToString(sentDate: Date): Promise<string>{
    return `${new Date(sentDate).toISOString().slice(0, 10)}  ${new Date(sentDate).toISOString().slice(11, 19)}`;
}

export async function createFileWithBirthdayData(id: string): Promise<string | null>{
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

async function createHeader(location: string, time: string): Promise<string | null>{
    return (`
<p>Zapraszam na moją imprezę urodzinową.</p>
<p>Odbędzie sie ona w <strong>${location}</strong>.</p>
<p>W terminie <strong>${time}</strong>.</p>
`);
}

async function createHeadOfBody(obj: GuestRecord): Promise<string | null>{
    return `<p>Potwierdzenie przygotowano dla <strong>${obj.name} ${obj.lastName}</strong></p>`;
}

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
