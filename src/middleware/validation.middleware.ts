import z, { ZodObject } from 'zod';

import { NextFunction, Request, Response } from "express"
import { ValidationError } from '../utils/Error';

export const validation=(schema:z.ZodObject)=>{
    return (req:Request,res:Response, next :NextFunction)=>{
        const data={
            ...req.body,
            ...req.params,
            ...req.query,
            files:req.files,
            ...req.file
        }
        // console.log(req.files);
        

        const result=schema.safeParse(data)
        if(!result.success){
            const errors = result.error.issues.map((error)=>{
                return `${error.path}=>${error.message}\n`
            })
            
            
            throw new ValidationError(errors.join(','))
        }
        next()
    }
}