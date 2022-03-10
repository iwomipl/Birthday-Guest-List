import {ValidationError} from "../utils/errors";
import {v4 as uuid} from 'uuid';
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
import {dateOfBirthday} from "../utils/variables";

type GuestRecordResults = [GuestRecord[], FieldPacket[]];

export class GuestRecord {
    public id?: string;
    public name: string;
    public lastName: string;
    public willCome: number;
    public startTime?: Date;
    public resignedAt?: Date;

    constructor(obj: Omit<GuestRecord, 'insert' | 'setAbsentPresent' | 'delete' | 'validateTimeOfResigning' | 'findByNameAndLastName'>) {
        const {id, name, lastName, startTime, resignedAt, willCome} = obj;
        if(name.length <3 || name.length >50){
            throw new ValidationError(`Imię musi posiadać od 3 do 50 znaków. Aktualnie jest to ${name.length}.`);
        }
        if(lastName.length <3 || lastName.length >50){
            throw new ValidationError(`Imię musi posiadać od 3 do 50 znaków. Aktualnie jest to ${name.length}.`);
        }
        this.id = id ?? uuid();
        this.name = name;
        this.lastName = lastName;
        this.startTime = startTime;
        this.resignedAt = resignedAt;
        this.willCome = willCome;
    }

    validateTimeOfResigning(){
        const timeBeforeBirthdayToResign = (60 * 60 * 5);
        return (dateOfBirthday.getTime() - new Date().getTime() >= timeBeforeBirthdayToResign);
    }

    async insert(): Promise<string>{
       await pool.execute("INSERT INTO `guests`(`id`, `name`, `lastName`,`startTime`, `willCome`) VALUES (:id, :name, :lastName, :startTime, :willCome)", {
           id: this.id,
           name: this.name,
           lastName: this.lastName,
           startTime: new Date(),
           willCome: this.willCome,
       });
        return this.id;
    }

    async delete(): Promise<string>{
        if (!this.id) {
            throw new ValidationError('Niestety nie udało się usunąć gościa.');
        }
        await pool.execute('DELETE FROM `guests` WHERE `id` = :id', {
            id: this.id,
        });
        return `Gość ${this.name} ${this.lastName} został usunięty z listy gości.`;
    }

    async setAbsentPresent(): Promise<void> {
        const {willCome} = await GuestRecord.getOne(this.id);

        await pool.execute('UPDATE `guests` SET `willCome` = :willCome WHERE `id` = :id', {
            willCome: willCome ? 0 : 1,
            id: this.id,
        })
    }

    async findByNameAndLastName(): Promise<void>{

    }

    static async getOne(id: string): Promise<GuestRecord | null>{
       const [results] = await pool.execute('SELECT * FROM `guests` WHERE `id`=:id',{
            id,
        }) as GuestRecordResults;

       return results.length === 0 ? null : results[0];
    }

    static async listAll(): Promise<GuestRecord[]>{
        const [results] = await pool.execute('SELECT * FROM `guests` ORDER BY `startTime` DESC') as GuestRecordResults;

        return results.map(obj => new GuestRecord(obj));
    }

    static async isNameTaken(sentName: string, sentLastName: string): Promise<boolean>{
        const results = await GuestRecord.listAll();
        const trimmedNames = sentName.trim()+sentLastName.trim();

        const isStatusOpen = results.filter((obj) => {
            return (obj.name.trim()+obj.lastName.trim() === trimmedNames);
        }, 0);

        return isStatusOpen.length > 0;
    }

}