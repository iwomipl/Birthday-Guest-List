import { normalize, resolve, dirname } from "path";
import {writeFile, appendFile} from "fs/promises";
import {dateOfBirthday, locationOfBirthday, timeBeforeBirthdayToResignInMiliseconds} from "./variables";
import {GuestRecord} from "../records/guest.record";

//sprawdzenie czy akcja odbywa się 5 godzin przed planowymi urodzinami
export async function validateTimeOfResigning(): Promise<boolean>{
    return ((dateOfBirthday.getTime() - new Date().getTime()) >= timeBeforeBirthdayToResignInMiliseconds);
}

//bezpieczne stworzenie ścieżki do katalogu, utrudniające wyjście z katalogu głównego projektu
export async function safeJoin(base: string, target: string): Promise<string> {
    const targetPath = `.${normalize(`/${target}`)}`;
    return resolve(base, targetPath);
}

//funkcja wycinająca źle wyglądające informacje z obiektu Date tworząca stringa gotowego do pokazania na stronie
export async function dateToString(sentDate: Date): Promise<string>{
    return `${new Date(sentDate).toISOString().slice(0, 10)}  ${new Date(sentDate).toISOString().slice(11, 19)}`;
}

//Funkcja tworząca plik, który wysłany zostanie do Gościa, funkcja zwraca ścieżkę do pliku
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

//funkcja tworząca część pliku HTML wysyłanego do użytkownika
async function createHeader(location: string, time: string): Promise<string>{
    return (`
<p>Zapraszam na moją imprezę urodzinową.</p>
<p>Odbędzie sie ona w <strong>${location}</strong>.</p>
<p>W terminie <strong>${time}</strong>.</p>
`);
}

//Funkcja generująca kolejną część pliku
async function createHeadOfBody(obj: GuestRecord): Promise<string>{
    return `<p>Potwierdzenie przygotowano dla <strong>${obj.name} ${obj.lastName}</strong></p>`;
}

//funkcja iterująca przez pobraną tabelę gości i tworząca główne ciało wysyłanego pliku
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

//Wielokrotnie powtarzająca się przed renderowaniem czynność została przesłana do tej funkcji
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
