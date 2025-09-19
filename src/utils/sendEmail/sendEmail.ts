import  nodemailer  from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import "dotenv/config"



export const sendEmail= async({to, subject,html}:{to:string, subject:string, html:string})=>{
    console.log(process.env.EmailUser);
    console.log(process.env.EmailPass);
    const transporter=nodemailer.createTransport({
        host:process.env.EmailHOST,
        port:process.env.EmailPort,
        secure:true,
        service:"gmail",
        auth:{
            user:process.env.EmailUser,
            pass:process.env.EmailPass
        }
    } as SMTPTransport.Options )


    const main=async () => {
        const info=await transporter.sendMail({
            from:`socialApp "<${process.env.EmailUser}>"`,
            to,
            subject,
            html
        })
        console.log({info});
        
    }
    main().catch((err)=>{
        console.log(err);
        
    })
}