import dotenv from "dotenv"
import express ,{NextFunction, Request, Response} from "express"
import path from "path"
import baseRouter from "./routes"
import { IError } from "./utils/Error"
import { ConnnectDB } from "./DB/db.connection"
import { sendEmail } from "./utils/sendEmail/sendEmail"
import { UserRepo } from "./modules/authModule/auth.repo"
import {Server, Socket} from "socket.io"
import { IUser } from "./DB/models/user.model"
import { decodeToken, TokenTypesEnum } from "./middleware/auth.middleware"
import { HydratedDocument } from "mongoose"
import cors,{ CorsOptions } from "cors"
import { inilialize } from "./modules/gateway/gateway"

dotenv.config({
    path:path.resolve('./src/config/.env')
})
const app=express()


const corsOptions: CorsOptions = {
    origin: ["http://127.0.0.1:5501", "http://localhost:5501"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json())

export const bootstrap=async ()=>{
    const port=process.env.PORT
    await ConnnectDB()


    // sendEmail()


    app.use("/api/v1",baseRouter)


    app.use((err:IError, req: Request, res:Response, next: NextFunction)=>{
        return res.status(err.statusCode || 500).json({
            errMsg:err.message,
            status:err.statusCode || 500,
            stack:err.stack
        })
    })

    const httpServer=app.listen(port,()=>{
        console.log("Server is running on port: " + port);
        
    })

    inilialize(httpServer)
}