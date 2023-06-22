export const TMStoPercentage = (tms: number): number => {
    if(tms == 0){
        return 0
    }
    else if (tms < 1){
        console.error("TMS must be at least 1")
        return NaN
    } else if (tms > 5){
        console.error("TMS must be at most 5")
        return NaN
    } else {
        return (tms - 1) * 25  
    }
}
