export class Survey{
    channel_Name: string ;
    completed_amount: number; 
    participants: number ;
    TMS_Score: number ;
    date: Date ;

    constructor(channel_Name: string, completed_amount: number, participants: number, TMS_Score: number, date: Date) {
        this.channel_Name = channel_Name;
        this.completed_amount = completed_amount;
        this.participants = participants;
        this.TMS_Score = TMS_Score;
        this.date = date;
    }
    
}