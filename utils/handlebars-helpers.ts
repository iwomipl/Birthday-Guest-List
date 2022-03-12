export const handlebarsHelpers = {
    isAbsent: (willCome: string) => !!Number(willCome),
    ilLogged: (id: string) => !!id,
    isMessage: (message: string) => !!message,
    isResignedAt: (resignedAt: string) => !!resignedAt,
    cutResignationTime: (date: Date) => `${new Date(date).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}  ${new Date(date).toLocaleTimeString()}`,
}
