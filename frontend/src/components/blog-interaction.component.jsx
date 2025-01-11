import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const BlogInteraction = ({ blog }) => {

    let { blog: { title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog } = useContext(BlogContext);

    let { userAuth: { username } } = useContext(UserContext);
    
    console.log(username);
    return (
        <>
            {/* put interactions between hrs(lines) */}
            <hr className="border-grey my-2"></hr>
            {/* interaction buttons (justify-between : put children left and right end ) */}

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">

                    {/* like button */}
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
                        <i className="fi fi-rr-heart" />
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>

                    {/* comment button */}
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
                        <i className="fi fi-rr-comment-dots" />
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>
                </div>

                {/* making a tweet link */}
                <div className="flex gap-6 items-center">
                    
                    {
                        username == author_username ?
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple"> Edit</Link> : ""
                    }
                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}><i className="fi fi-brands-twitter hover:text-twitter"/></Link>
                </div>
            </div>
            <hr className="border-grey my-2"></hr>
        </>

    )
}

export default BlogInteraction;