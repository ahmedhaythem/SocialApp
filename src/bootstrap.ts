import dotenv from "dotenv"
import express ,{NextFunction, Request, Response} from "express"
import path from "path"
import baseRouter from "./routes"
import { IError } from "./utils/Error"
import { ConnnectDB } from "./DB/db.connection"
import { sendEmail } from "./utils/sendEmail/sendEmail"


dotenv.config({
    path:path.resolve('./src/config/.env')
})
const app=express()


export const bootstrap=async ()=>{
    const port=process.env.PORT
    await ConnnectDB()


    // sendEmail()

    app.use(express.json())

    app.use("/api/v1",baseRouter)


    app.use((err:IError, req: Request, res:Response, next: NextFunction)=>{
        return res.status(err.statusCode || 500).json({
            errMsg:err.message,
            status:err.statusCode || 500,
            stack:err.stack
        })
    })


    app.listen(port,()=>{
        console.log("Server is running on port: " + port);
        
    })
}