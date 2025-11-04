



export class ChatSocketServieces{
    constructor(){ }
    sayHi=(message:string, callback:Function)=>{
            console.log(message);
            
            callback("hello")
        }
}