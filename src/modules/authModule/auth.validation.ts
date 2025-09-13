import z from "zod"

export const signupSchema=z.object({
    name:z.string().min(3).max(15),
    email:z.email(),
    password:z.string().min(8).max(20),
    confirmPassword:z.string()
}).superRefine((args,ctx)=>{
    if(args.password!=args.confirmPassword){
        ctx.addIssue({
            code:"custom",
            path:['confirmPassword'],
            message:'confirm password must be equal to password'

        })
    }
})