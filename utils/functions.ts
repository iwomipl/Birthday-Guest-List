import {dateOfBirthday, timeBeforeBirthdayToResignInMiliseconds} from "./variables";

export function validateTimeOfResigning(): boolean{
    return ((dateOfBirthday.getTime() - new Date().getTime()) >= timeBeforeBirthdayToResignInMiliseconds);
}