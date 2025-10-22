import { Model } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { PostModel } from "../../DB/models/post.model";
import { IPost } from "./post.types";







export class PostRepo extends DBRepo<IPost>{
    
    constructor(protected override readonly model:Model<IPost>=PostModel){
        super(model)
    }

}