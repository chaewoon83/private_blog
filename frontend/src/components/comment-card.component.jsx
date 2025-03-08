//if reply increase leftVal for differentiate

import { useContext, useState } from "react";
import { UserContext } from "../App";
import { getDay } from "../common/date";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";

const CommentCard = ({index, leftVal, commentData}) => {

    let { commentedAt, comment, commented_by : {personal_info: { profile_img, fullname, username}}, _id} = commentData;

    let { userAuth: {access_token}} = useContext(UserContext);

    const [ isReplying, setReplying ] = useState(false);

    const handleReplyClick = () => {
        if(!access_token){
            return toast.error("login first to leave a reply");
        }

        setReplying(preVal => !preVal);
        
    }
    return (
        <div className = "w-full" style={{ paddingLeft: `${leftVal * 10}px`}}>
            {/* commentborder */}
            <div className="my-5 p-6 rounded-md border border-grey">
                {/* contain comment data */}
                <div className="flex gap-3 items-center mb-8">
                    <img src = {profile_img} className="w-6 h-6 rounded-full"></img>

                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-3"> {comment} </p>
                {/* loading adding reply button */}
                <div className="flex gap-5 items-center mt-5">
                    <button className="underline" onClick={handleReplyClick}>Reply</button>
                </div>
                {
                    isReplying ?
                    <div classname = "mt-8">
                        <CommentField action="reply" index={index} replyingTo={_id} setReplying = {setReplying}></CommentField>
                    </div> : ""
                }
            </div>

        </div>
    )
}

export default CommentCard;