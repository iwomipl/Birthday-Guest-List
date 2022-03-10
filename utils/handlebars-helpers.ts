import {dateToString} from "./functions";

export const handlebarsHelpers = {
    isAbsent: (willCome: string) => !!Number(willCome),
    ilLogged: (id: string) => !!id,
    isMessage: (message: string) => !!message,
    isResignedAt: (resignedAt: string) => !!resignedAt,
    showTime: (dateFromHandlebar: Date): string => `${dateToString(dateFromHandlebar)}`,
}
