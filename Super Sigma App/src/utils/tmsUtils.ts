export const TMStoPercentage = (tms: number): number => {
    if (tms < 1){
        throw new Error("TMS must be at least 1")
    } else if (tms > 5){
        throw new Error("TMS must be at most 5")
    } else {
        return (tms - 1) * 25  
    }
}
