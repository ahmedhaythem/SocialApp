import { Response } from 'express';


export const successHandler=({res,msg="Done",data={},status=200}:{res:Response,msg?:string,data?:Object,status?:number}): Response =>{
    return res.status(status).json({
        msg,
        status,
        data

    })
}