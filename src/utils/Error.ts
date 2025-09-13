import z from "zod"

export interface IError extends Error{
    statusCode:number
}


export class ApplicationException extends Error{
    statusCode:number

    constructor(msg:string,statusCode:number,options?:ErrorOptions){
        super(msg,options)
        this.statusCode=statusCode
    }
}

export class ValidationError extends ApplicationException{
    constructor(msg:string){
        super(msg,422)
        console.log(this.stack);
        
    }
}