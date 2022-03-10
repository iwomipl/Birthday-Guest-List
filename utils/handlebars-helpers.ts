export const handlebarsHelpers = {
    isAbsent: (willCome: string) => !!Number(willCome),
    isMessage: (message: string) => !!message,
    showTime: (dateFromHandlebar: Date): string => `${new Date(dateFromHandlebar).toISOString().slice(0, 10)}  ${new Date(dateFromHandlebar).toISOString().slice(11, 19)}`,
    isId: (id: string, idFromCookie:  string) => (id === idFromCookie),
}
