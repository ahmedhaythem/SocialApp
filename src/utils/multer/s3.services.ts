import { createReadStream } from 'fs';
import { StoreIn } from './multer';
import { DeleteObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { s3Config } from './s3Config';
import { ApplicationException, FileUploadException } from '../Error';
import { Upload } from '@aws-sdk/lib-storage';
import { nanoid } from 'nanoid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';




export const uploadSingleFile=async({
        Bucket=process.env.BUCKET_NAME as string,
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

    }):Promise<string>=>{
        const upload= new Upload({
            client: s3Config(),
            partSize:10*1024*1024,
            params:{
                Bucket,
                ACL,
                Key:`socialApp/${path}/${nanoid(15)}__${file.originalname}`,
                Body:storeIn==StoreIn.memory
                    ? file.buffer
                    :createReadStream(file.path),
                ContentType:file.mimetype
            }
        })
        upload.on('httpUploadProgress',(process)=>{
            console.log({process});
            
        })
        const {Key}=await upload.done()
        if(!Key){
            throw new FileUploadException()
        }
        return Key
}

export const uploadMultiFiles=async(
    {
        Bucket=process.env.BUCKET_NAME as string,
        ACL="private",
        path="general",
        files,
        storeIn=StoreIn.memory
    }:{
        Bucket?:string,
        ACL?:ObjectCannedACL,
        path?:string,
        files:Express.Multer.File[],
        storeIn?:StoreIn
    }
):Promise<string[]>=>{
    const keys=Promise.all(
        storeIn==StoreIn.memory ?
        files.map(file=>{
            return uploadSingleFile({
                Bucket,
                ACL,
                path,
                file,
                storeIn
            })
        })
        :
        files.map(file=>{
            return uploadSingleLargeFile({
                Bucket,
                ACL,
                path,
                file,
                storeIn
            })
        })
    )
    return keys
}

export const createPreSignedURL=async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    path="general",
    ContentType,
    Originalname,
    expiresIn=120
}:{
    Bucket?:string,
    path?:string,
    ContentType:string,
    Originalname:string,
    expiresIn?:number

})=>{
    const command= new PutObjectCommand({
        Bucket,
        Key:`socialApp/${path}/${nanoid(15)}-presigned-${Originalname}`,
        ContentType,

    })
    const url =await getSignedUrl(s3Config(),command,{
        expiresIn,
    })
    if(!url || !command?.input?.Key){
        throw new ApplicationException("faild to generate presignedURL",500)
    }
    return {url,Key:command.input.Key}
}



export const s3DeleteFolder = async (folderPath: string) => {
    const s3 = new S3Client({ region: process.env.AWS_REGION as string});
    const list = await s3.send(new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME!,
        Prefix: folderPath,
    }));

    if (!list.Contents) return;

    for (const file of list.Contents) {
        await s3.send(new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: file.Key!,
        }));
    }
};