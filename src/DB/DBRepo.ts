import { FilterQuery, HydratedDocument, Model, ObjectId, ProjectionFields, QueryOptions } from "mongoose";
import { IUser } from "./models/user.model";





export abstract class DBRepo<T>{
    constructor(protected readonly model:Model<T>){}

    create= async({data} :{data:Partial<T>}):Promise< HydratedDocument <T>>=>{
        const doc=await this.model.create(data)
        return doc
    }


    findOne= async({filter, projection, options}:{filter:FilterQuery<T>, projection?: ProjectionFields<T>, options?: QueryOptions}):Promise<HydratedDocument<T>|null>=>{
        const doc=await this.model.findOne(
            filter,
            projection,
            options
        )

        return doc
    }

    findById= async({id, projection, options}:{id:string, projection?: ProjectionFields<T>, options?: QueryOptions}):Promise<HydratedDocument<T>|null>=>{
        const doc=await this.model.findById(
            id,
            projection,
            options
        )

        return doc
    }

    find= async({filter, projection, options}:{filter?:FilterQuery<T>, projection?: ProjectionFields<T>, options?: QueryOptions}):Promise<HydratedDocument<T>[]|[]>=>{
        const query= this.model.find(
            filter || {},
            projection,
            options
        )
        if(options?.lean){
            query.lean()
        }
        const docs =await query.exec()
        return docs
    }
}