import { DBRepo } from "../DBRepo";
import { FreindRequestModel, IFriendRequest } from "../models/friendRequest.model";




export class friendRequestRepo extends DBRepo<IFriendRequest>{
    constructor(){
        super(FreindRequestModel)
    }
}