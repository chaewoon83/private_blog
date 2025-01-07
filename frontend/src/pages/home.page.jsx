import axios from "axios";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component"
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";


const HomePage = () => {

    let [blogs, setBlogs] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null);
    let [pageState, setPageState] = useState("home");

    let categories = ["programming", "anime", "ai", "cooking", "airport", "game", "tech", "Mario"];

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then(({ data }) => {
                setBlogs(data.blogs);
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

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();

        setBlogs(null);

        if(pageState == category){
            setPageState("home");
            return;
        }
        setPageState(category);
    }

    useEffect(() => {

        activeTabRef.current.click();

        if(pageState == "home"){
            fetchLatestBlogs();
        }
        if(!trendingBlogs)
        {
            fetchTrendingBlogs();
        }

    }, [pageState])

    return (
        <AnimationWrapper>
            {/* height = viewport height - navbarheight */}
            <section className="min-h-[calc(100vh-80px)] justify-center gap-10 flex">
                {/* lastest blogs left side */}
                <div className="w-full">
                    {/* Home and Trending Blogs Navigation */}
                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <>
                            {
                                blogs == null ? <Loader />
                                    : blogs.map((blog, i) => {
                                        return (
                                            <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
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
                                            <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                                                <MinimalBlogPost blog={blog} index={i} />
                                            </AnimationWrapper>
                                        )

                                    })
                            }
                        </>

                    </InPageNavigation>
                </div>
                {/* filters and trending blogs rightsidde */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">

                    <div className="flex flex-col gap-10">

                        <div>
                            {/* categorizing*/}
                            <h1 className="fond-medium text-xl mb-8"> 
                                Sotries from all interests
                            </h1>

                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <button onClick={loadBlogByCategory}
                                        className={"tag " + (pageState == category.toLowerCase() ? "bg-black text-white" : "")} key={i}>
                                            {category}
                                        </button>
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            {/* trending text and icon*/}
                            <h1 className="font-medium text-xl mb-8">Trending
                                <i className="fi fi-rr-arrow-trend-up ml-2 relative top-0.5" />
                            </h1>
                            {/* blog title description*/}
                            {
                                trendingBlogs == null ? <Loader />
                                    : trendingBlogs.map((blog, i) => {
                                        return (
                                            <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                                                <MinimalBlogPost blog={blog} index={i} />
                                            </AnimationWrapper>
                                        )

                                    })
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;