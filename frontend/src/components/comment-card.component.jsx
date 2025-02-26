//if reply increase leftVal for differentiate

import { getDay } from "../common/date";

const CommentCard = ({index, leftVal, commentData}) => {

    let { commentedAt, comment, commented_by : {personal_info: { profile_img, fullname, username}}} = commentData;
    return (
        <div className = "w-full" style={{ paddingLeft: `${leftVal * 10}px`}}>
            {/* commentborder */}
            <div className="my-5 p-6 rounded-md border border-grey">
                {/* contain comment data */}
                <div className="flex gap-3 items-center mb-8">
                    <img src = {profile_img} className="w-6 h-6 rounded-full"></img>

                    <p className=""line-clamp-1>{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-3"> {comment} </p>
                {/* loading adding reply button */}
                <div>

                </div>
            </div>

        </div>
    )
}

export default CommentCard;