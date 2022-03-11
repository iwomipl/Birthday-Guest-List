export const handlebarsHelpers = {
    isAbsent: (willCome: string) => !!Number(willCome),
    ilLogged: (id: string) => !!id,
    isMessage: (message: string) => !!message,
    isResignedAt: (resignedAt: string) => !!resignedAt,
    cutResignationTime: (date: Date) => `${new Date(date).toISOString().slice(0, 10)}  ${new Date(date).toISOString().slice(11, 19)}`,
}
