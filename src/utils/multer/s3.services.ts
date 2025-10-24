import { createReadStream } from 'fs';
import { StoreIn } from './multer';
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Config } from './s3Config';
import { ApplicationException, FileUploadException } from '../Error';
import { Upload } from '@aws-sdk/lib-storage';
import { nanoid } from 'zod';




export const uploadSingleFile=async({
        Bucket=process.env.BUCKET_NAME,
        ACL="private",
        path="general",
        file,
        storeIn=StoreIn.memory
    }:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path?:string,
        file:Express.Multer.File,
        storeIn?:StoreIn

    }):Promise<string>=>{
    const commend= new PutObjectCommand({
        Bucket,
        ACL,
        Key:`socialApp/${path}/${nanoid(15)}__${file.originalname}`,
        Body:storeIn==StoreIn.memory
            ? file.buffer
            :createReadStream(file.path),
        ContentType:file.mimetype
    })
    await s3Config().send(commend)
    if(!commend.input.Key){
        throw new FileUploadException()
    }
    return commend.input.Key
}

export const uploadSingleLargeFile=async({
        Bucket=process.env.BUCKET_NAME,
        ACL="private",
        path="general",
        file,
        storeIn=StoreIn.memory
    }:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path?:string,
        file:Express.Multer.File,
        storeIn?:StoreIn

    })=>{
        const upload= new Upload({
            client:s3Config(),
            params:{
                Bucket,
                ACL,

            }
        })
}