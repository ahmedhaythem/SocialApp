import { Request, Response } from "express";
import { success } from "zod";
import { successHandler } from "../../utils/successHandler";






interface IPostService{
    createPost(req:Request, res:Response):Promise<Response>
}



export class PostServices implements IPostService{
    createPost= async (req: Request, res: Response): Promise<Response>=> {
        
        console.log(req.body);
        
        return successHandler({res})
    }
}