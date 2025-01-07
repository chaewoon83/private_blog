
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";


const HomePage = () => {


    return (
        <AnimationWrapper>
            {/* height = viewport height - navbarheight */}
            <section className="min-h-[calc(100vh-80px) justify-center gap-10">
                 {/* lastest blogs left side */}
                <div className = "w-full">
                    {/* Home and Trending Blogs Navigation */}
                    <InPageNavigation routes={ ["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <h1>Latest Blog</h1>

                        <h1>Trending Blog</h1>
                        
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