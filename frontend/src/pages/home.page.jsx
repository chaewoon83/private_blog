import axios from "axios";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component"
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";


const HomePage = () => {

    let [ latestBlogs, setLatestBlogs ] = useState(null);
    let [ trendingBlogs, setTrendingBlogs ] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
        .then(({ data }) => {
            setLatestBlogs(data.blogs);
        })
        .catch(err => console.log(err));
    }

    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({ data }) => {
            setTrendingBlogs(data.blogs);
            console.log(data.blogs);
        })
        .catch(err => console.log(err));
    }

    useEffect(() => {
        fetchLatestBlogs();
        fetchTrendingBlogs();
    }, [])

    return (
        <AnimationWrapper>
            {/* height = viewport height - navbarheight */}
            <section className="min-h-[calc(100vh-80px) justify-center gap-10">
                 {/* lastest blogs left side */}
                <div className = "w-full">
                    {/* Home and Trending Blogs Navigation */}
                    <InPageNavigation routes={ ["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <>
                            {
                                latestBlogs == null ? <Loader /> 
                                : latestBlogs.map((blog, i) => {
                                    return (
                                        <AnimationWrapper transition={{duration: 1, delay: i *0.1 }} key = {i}>
                                            <BlogPostCard content={blog} author={blog.author.personal_info}/>
                                        </AnimationWrapper>
                                    )

                                })
                            }
                        </>

                        <>

                            {
                                trendingBlogs == null ? <Loader /> 
                                : trendingBlogs.map((blog, i) => {
                                    return (
                                        <AnimationWrapper transition={{duration: 1, delay: i * 0.1 }} key = {i}>
                                            <MinimalBlogPost blog={blog} index={i}/>
                                        </AnimationWrapper>
                                    )

                                })
                            }
                        </>

                    </InPageNavigation>
                </div>
                {/* filters and trending blogs rightsidde */}
                <div>

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;