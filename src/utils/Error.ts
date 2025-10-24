import z from "zod"
import { extend } from "zod/v4/core/util.cjs"

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

export class NotValidEmail extends ApplicationException{
    constructor(msg:string="not vaild email"){
        super(msg,400)
        console.log(this.stack);
        
    }
}


export class NotFoundException extends ApplicationException{
    constructor(msg:string="not found"){
        super(msg,404)
        console.log(this.stack);
        
    }
}


export class InvalidTokenException extends ApplicationException{
    constructor(msg:string="in-valid token"){
        super(msg,409)
        console.log(this.stack);
        
    }
}

export class InvalidOTPException extends ApplicationException{
    constructor(msg:string="in-valid OTP"){
        super(msg,409)
        console.log(this.stack);
        
    }
}

export class NotConfirmedException extends ApplicationException{
    constructor(msg:string="user not confirmed"){
        super(msg,401)
        console.log(this.stack);
        
    }
}


export class FileUploadException extends ApplicationException{
    constructor(msg='upload file failed'){
        super(msg,400)
    }
}