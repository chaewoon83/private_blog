import {Toaster, toast} from "react-hot-toast";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { EditorContext } from "../pages/editor.pages";
import AnimationWrapper from "../common/page-animation";
import Tag from "./tags.component";
import { UserContext } from "../App";



const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, blog: {title, banner, tags, des, content}, setEditorState, setBlog } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext);

    let navigate = useNavigate();

    const handleClosePublishEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({...blog, title: input.value});
    }

    const handleBlogDesChange = (e) => {
        let input = e.target;
        setBlog({...blog, des: input.value});
    }

    const handleTitleKeyDown = (e) => {
        if(e.KeyCode == 13)
        {
            e.preventDefault();
        }

    }

    // update tag and put input tag into context
    const handleTagKeyDown = (e) => {

        if(e.keyCode == 13 || e.keyCode == 188){
            e.preventDefault();

            let tag = e.target.value;

            if(tags.length < tagLimit){

                if(!tags.includes(tag) && tag.length){
                    setBlog({...blog, tags: [...tags, tag]})
                }
            }
            else{
                toast.error(`You can add max ${tagLimit} Tags`);
            }
            e.target.value = "";
        }
    }

    const publishBlog = (e) => {

        //prevent mulitple submission
        if(e.target.className.includes("disable")){
            return;
        }

        //check valid inputs
        if(!title.length){
            return toast.error("Write blog title before publish");
        }
        if(!des.length || des.length > 200){
            return toast.error(`Write description within ${characterLimit} characters before publish `);
        }
        if(!tags.length){
            return toast.error("Write tags before publish");
        }
        if(tags.length > tagLimit){
            return toast.error(`Write below ${tagLimit} tags`);
        }

        let loadingToast = toast.loading("Publishing....");

        e.target.classList.add('disable');

        let blogObj = {
            title, banner, des, content, tags, draft: false
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(()=> {

            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("published");

            //navigate user to homepage
            setTimeout(()=> {
                navigate("/");
            }, 500)
        })
        .catch(({ response }) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
        })
    }

    return(
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                onClick={handleClosePublishEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="w-full max-w-[600px] block mx-auto">

                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={ banner } />
                    </div>

                    {/* title preview */}
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2 overflow-hidden text-ellipsis">{ title }</h1>
                    
                    {/* description preview */}
                    <p className="font-gelasio line-clamp-3 text-xl leading-7 mt-4 overflow-hidden text-ellipsis">{ des }</p>
                </div>

                {/* change title, description */}
                <div className="border-grey lg:border-1 lg-pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input type="text" placeholder="Blog Title" 
                    defaultValue={title} className="input-box pl-4 lg:pl-8"
                    onChange={handleBlogTitleChange}/>

                    <p className="text-dark-grey mb-2 mt-9"> Short description</p>
                    <textarea
                        maxLength={characterLimit}
                        default={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}>
                    </textarea>

                    <p className="mt-1 mr-3 text-dark-grey text-sm text-right ">{ characterLimit - des.length }</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - ( Helps is searching and ranking blog post )</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic"
                        className="input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                        onKeyDown={handleTagKeyDown}/>
                        {
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex = {i} key={i+tag} />
                            })
                        }
                        
                    </div>
                    <p className="mt-1 mb-4 mr-2 text-dark-grey text-right"> {tagLimit - tags.length} / {tagLimit}</p>

                    <button className="btn-dark px-8"
                        onClick={publishBlog} >Publish</button>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;