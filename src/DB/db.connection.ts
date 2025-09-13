import mongoose from "mongoose"

export const ConnnectDB= (): void=>{
    mongoose.connect('mongodb://127.0.0.1:27017/socailApp')
        .then(()=>{
            console.log("DB connected successfully");
            
        })
        .catch((err)=>{
            console.log("DB connection failed =>",err);
            
        })
}