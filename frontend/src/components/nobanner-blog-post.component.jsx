import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ( { blog, index }) => {

    let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img}}, publishedAt } = blog;

    return (
        <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
            <h1 className="text-4xl sm:text-3xl lg:text-5xl font-bold text-grey leading-none">{index < 10 ? "0" + (index + 1) : index + 1}</h1>

            <div>
                {/* Username, profile_img, and date */}
                <div className="flex gap-2 items-center mb-7">
                    <img src={profile_img} className="w-6 h-6 rounded-full"/>
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-medium leading-7 line-clamp-3 sm:line-clamp-2">{ title }</h1>
            </div>
        </Link>
    )
}

export default MinimalBlogPost;