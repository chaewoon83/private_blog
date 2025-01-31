import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";

export const BlogContext = createContext({});

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: ''
}

const BlogPage = () => {

    let { blog_id } = useParams();
    const [blog, setBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [ similarBlogs, setSimilarBlogs ] = useState(null);
    const [ isLikedByUser, setLikedByUser ] = useState(false);

    let limitSimilarBlog =6;

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;
    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
            .then(async ({ data: { blog } }) => {
                console.log(blog.content);
                await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: limitSimilarBlog, eliminate_blog: blog_id })
                .then(({ data }) => {
                    setSimilarBlogs(data.blogs);
                })
                setBlog(blog);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        resetState();
        fetchBlog();
    }, [blog_id])

    const resetState = () => {
        setLoading(true);
        setBlog(blogStructure);
        setSimilarBlogs(null);
    }

    return (
        <AnimationWrapper>
            {
                //render loader when loading is true
                loading ? <Loader /> :

                    <BlogContext.Provider value={{blog, setBlog, isLikedByUser, setLikedByUser}}>
                {/* basic div component */}
                        <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                            {/* banner image */}
                            <img src={banner} className="aspect-video" />
                            {/* texts including title profile and content */}
                            <div className="mt-12">
                                <h2>{title}</h2>
                                <div className="flex max-sm:flex-col justify-between my-8">
                                    <div className="flex gap-5 items-start">
                                        <img src={profile_img} className="w-12 h-12 rounded-full" />
                                        <p>{fullname}
                                            <br />
                                            @ <Link to={`/user/${author_username}`} className="underline">
                                                {author_username}</Link>
                                        </p>
                                    </div>
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                                </div>
                            </div>

                            {/* render blog content between blog interactions */}
                            <BlogInteraction />

                                <div className="my-12 font-gelasio blog-page-content">
                                    {
                                        content[0].blocks.map((block, i) => {
                                            return <div key={i} className="my-4 md:my-8">
                                                <BlogContent block={block}/>
                                            </div>;
                                        })
                                    }
                                </div>
                            
                            <BlogInteraction />

                            {/* render similar blogs */}
                            {
                                similarBlogs != null && similarBlogs.length ?
                                <>
                                    <h1 className="text-2xl mt-14 mb-10 font-medium"> similar Blogs</h1>
                                    {
                                        similarBlogs.map((blog, i) => {
                                            let { author: { personal_info }} = blog;

                                            return <AnimationWrapper key ={i} transition={{duration: 1, delay:i * 0.08}}>
                                                <BlogPostCard content={blog} author={personal_info}/>
                                            </AnimationWrapper>
                                        })
                                    }
                                </>
                                : ""
                            }


                        </div>
                    </BlogContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default BlogPage;