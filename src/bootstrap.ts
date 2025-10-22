import dotenv from "dotenv"
import express ,{NextFunction, Request, Response} from "express"
import path from "path"
import baseRouter from "./routes"
import { IError } from "./utils/Error"
import { ConnnectDB } from "./DB/db.connection"
import { sendEmail } from "./utils/sendEmail/sendEmail"
import { UserRepo } from "./modules/authModule/auth.repo"


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

    // const test=async()=>{
    //     try {
    //         const userModel=new UserRepo()
    //         const user=await userModel.findOne({
    //             filter:{
    //                 // _id:"68cd4c998522ac2e69eb4269",
    //                 _id:"68cd4c998522ac2e69eb4269",
    //                 paranoId:false
    //             },
    //         })
    //         if(!user){
    //             throw new Error("User not Found")
    //         }
    //         console.log({user});
    //         // user.deleteAt=new Date(Date.now())
    //         // await user.save()

            
    //     } catch (error) {
    //         console.log({error});
            
    //     }

    // }

    // test()
    app.listen(port,()=>{
        console.log("Server is running on port: " + port);
        
    })
}