
export const TMStoPercentage = (tms: number): number => {
    if (tms <= 0){
        return 0
    } else {
        return (tms - 1) * 25  
    }
}
