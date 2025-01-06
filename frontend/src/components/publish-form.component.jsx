import {Toaster, toast} from "react-hot-toast";
import { useContext } from "react";

import { EditorContext } from "../pages/editor.pages";
import AnimationWrapper from "../common/page-animation";
import Tag from "./tags.component";



const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, blog: {title, banner, tags, des}, setEditorState, setBlog } = useContext(EditorContext);

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
        console.log(e.keyCode);
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

                    <button className="btn-dark px-8">Publish</button>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;