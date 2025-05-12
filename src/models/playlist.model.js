import {Schema,model} from "mongoose";
const playlistSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    }
},{timestamps:true});
export const Playlist=model("Playlist",playlistSchema);