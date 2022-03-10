export const handlebarsHelpers = {
    isAbsent: (willCome: string) => !!Number(willCome),
    ilLogged: (id: string) => !!id,
    isMessage: (message: string) => !!message,
    isResignedAt: (resignedAt: string) => !!resignedAt,
    showTime: (dateFromHandlebar: Date): string => `${new Date(dateFromHandlebar).toISOString().slice(0, 10)}  ${new Date(dateFromHandlebar).toISOString().slice(11, 19)}`,
}
