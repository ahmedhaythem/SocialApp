
import { HydratedDocument, Model, ProjectionFields, QueryOptions } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { IUser, UserModel } from "../../DB/models/user.model";




export class UserRepo extends DBRepo<IUser>{
    constructor(protected override readonly model:Model<IUser>=UserModel){
        super(model)
    }
    findByEmail=async({email,projection,options}:{email:string, projection?:ProjectionFields<IUser>,options?:QueryOptions}):Promise<HydratedDocument<IUser>| null>=>{
        const user=await this.model.findOne({email},projection,options)
        return user
    }

    updateOne=async({ filter,update,} : {filter: object, update: object})=>{
        const user=await this.model.updateOne(filter,update)
        return user
    }
}