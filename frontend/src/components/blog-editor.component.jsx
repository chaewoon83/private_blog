import { Link, useNavigate, useParams } from "react-router-dom";
import { useRef, useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";

import logo from "../imgs/logo.png"
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { EditorContext } from "../pages/editor.pages";
import { tools } from "./tools.component"
import { UserContext } from "../App";

const BlogEditor = () => {

    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState, bannerURL, setBannerURL } = useContext(EditorContext);

    let { userAuth: { access_token } } = useContext(UserContext);

    let { blog_id } = useParams();

    let navigate = useNavigate();

    useEffect(() => {
        setTextEditor(new EditorJS({
            holderId: "textEditor",
            data: Array.isArray(content) ? content[0] : content,
            tools: tools,
            placeholder: 'Text Editor',
            isReady: true
        }))

    }, []);

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";
        setBlog({ ...blog, title: input.value });
    }


    const handleBannerUpload = (e) => {
        let img = e.target.files[0];
        if (img) {

            let loadingToast = toast.loading("Uploading...");

            uploadImage(img)
                .then((url) => {
                    if (url) {
                        toast.dismiss(loadingToast);
                        toast.success("Uploaded!");
                        setBannerURL(url);
                        console.log(url);
                        //setBlog({...blog, banner: url});
                    }
                })
                .catch(err => {
                    toast.dismiss(loadingToast);
                    return toast.error(err);
                });
        }
    }

    const handleError = (e) => {
        let img = e.target;

        img.src = defaultBanner;
    }

    const handlePublishEvent = () => {

        if (!bannerURL.length) {
            return toast.error("Upload a blog banner to publish");
        }

        if (!title.length) {
            return toast.error("Write blog title to publish");
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, banner: bannerURL, content: data });
                    setEditorState("publish");
                }
                else {
                    return toast.error("Write something in blog to publish");
                }
            })
                .catch((err) => {
                    console.log(err);
                })

        }
    }

    const handleSaveDraft = (e) => {
        //prevent mulitple submission
        if (e.target.className.includes("disable")) {
            return;
        }

        //check valid inputs
        if (!title.length) {
            return toast.error("Write blog title before saving it as a draft");
        }

        let loadingToast = toast.loading("Saving Draft....");

        e.target.classList.add('disable');

        let blogObj = {
            title, bannerURL, des, content, tags, draft: true
        }

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(() => {

                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        toast.success("Saved");

                        //navigate user to homepage
                        setTimeout(() => {
                            navigate("/");
                        }, 500)
                    })
                    .catch(({ response }) => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        return toast.error(response.data.error);
                    })
            })
        }
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full text-ellipsis">
                    {title.length ? title : "New Blog"}
                </p>
                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2"
                        onClick={handlePublishEvent} >
                        Publish
                    </button>
                    <button className="btn-light py-2"
                        onClick={handleSaveDraft}>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">

                        <div className="aspect-video hover:opacity-60 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img
                                    src={bannerURL ? bannerURL : banner}
                                    className="z-20"
                                    onError={handleError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpeg, .jpg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>

                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder="Blog Title"
                            className="text-4xl font-medium w-full h-13
                             outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}>
                        </textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio"></div>
                    </div>
                </section>
            </AnimationWrapper>


        </>

    )
}

export default BlogEditor;