import { useContext, useState, createContext, useEffect } from "react";
import { UserContext } from "../App.jsx";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component.jsx";
import PublishForm from "../components/publish-form.component.jsx";
import Loader from "../components/loader.component.jsx";
import axios from "axios";

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }
}

export const EditorContext = createContext({});

const Editor = () => {

    let { blog_id } = useParams();

    const [blog, setBlog] = useState(blogStructure);

    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({ isReady: false });
    const [bannerURL, setBannerURL] = useState("");
    const [loading, setLoading] = useState(true);

    let { userAuth: { access_token } } = useContext(UserContext);

    useEffect(() => {
        // if user is from write blog page there is no loading
        if (!blog_id) {
            setLoading(false);
        }
        else {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id, draft: true, mode: 'edit' })
                .then(async ({ data: { blog } }) => {
                    console.log(blog);
                    setBlog(blog);
                    setBannerURL(blog.banner);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });

        }


    }, [])

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor, bannerURL, setBannerURL }}>
            {
                // check user is logged in
                access_token === null
                    ? <Navigate to="/signin" />
                    :
                    // check whether user finished loading
                    loading ? <Loader /> :
                        editorState == "editor" ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>

    )
}

export default Editor;