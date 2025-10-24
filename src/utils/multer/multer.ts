import { Request } from 'express';
import  multer, { diskStorage, memoryStorage }  from 'multer';
import { ApplicationException } from '../Error';



export enum StoreIn {
    disk='disk',
    memory="memory"
}


export const fileTypes = {
    images:['image/jpeg','image/png','image/gif']
}

export const uploadFile=({
    storeIn= StoreIn.memory,
    type= fileTypes.images
}:{
    storeIn?:StoreIn,
    type?:string[]
})=>{

    const storage = storeIn==StoreIn.memory
        ?memoryStorage()
        :diskStorage({})

        const fileFilter=(req:Request,file:Express.Multer.File, cb :CallableFunction)=>{
            if(!type.includes(file.mimetype)){
                return cb(new ApplicationException('use disk not memory',500),false)
            }
            cb(null,true)
        }
    return multer({storage,fileFilter})

}