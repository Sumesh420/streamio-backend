import mongoose, {Schema,model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    content:{
        type:String,
        required:true,
    }
},{timestamps:true});
mongoose.plugin(mongooseAggregatePaginate);
export const Comment=model("Comment",commentSchema);