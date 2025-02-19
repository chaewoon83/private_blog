import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";
import { BlogContext} from "../pages/blog.page";
//action => comment or reply
const CommentField = ({ action }) => {

    let { blog, blog: {_id, author: {_id: blog_author}, comments, comments: { results: commentsArr}, activity, activity: {total_comments, total_parent_comments}}, setBlog, settotalParentCommentsLoaded} = useContext(BlogContext);
    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    const [comment, setComment] = useState("");


    const handleComment = () => {

        if(!access_token){
            return toast.error("login first to leave a comment");
        }

        if(!comment.length){
            return toast.error("Write something to leave a comment"); 
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", { _id, blog_author, comment}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(({data}) => {
            //render comment component card
            setComment("");
            data.commented_by = { personal_info: { username, profile_img, fullname } };

            // update comment array 
            let newCommentArr;
            // childrenlevel = 0 means parent comment replying +1 children level
            data.childrenLevel = 0;

            newCommentArr = [ data, ...commentsArr ];

            let parentCommentIncrementval = 1;

            setBlog({ ...blog, 
                comments: { ...comments, results: newCommentArr }, 
                activity:{...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementval}})

                settotalParentCommentsLoaded(preVal => preVal + parentCommentIncrementval);
        })
        .catch(err=> console.log(err));

    }
    return (
        <>
            <textarea value = {comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder="Leave a Comment" className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"> </textarea>
            
            <button className = "btn-dark mt-5 px-10" 
            onClick={handleComment}>{action}</button>
        </>
    )
}

export default CommentField;