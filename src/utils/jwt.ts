
import  jwt, { Secret, SignOptions, verify } from "jsonwebtoken"
import { Payload } from "../middleware/auth.middleware"



export const createJwt=(payload:string | object, secert:Secret, options:SignOptions)=>{
    const token=jwt.sign(payload, secert, options)
    return token
}

export const verifyJWT=({token,secret}:{token:string,secret:Secret}):Payload=>{
    const payload=verify(token,secret) as Payload
    return payload
}