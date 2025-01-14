import { useContext, useState, createContext } from "react";
import { UserContext } from "../App.jsx";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component.jsx";
import PublishForm from "../components/publish-form.component.jsx";

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info : { } }
}

export const EditorContext = createContext({});

const Editor = () => {

    const [blog, setBlog] = useState(blogStructure);

    const [ editorState, setEditorState] = useState("editor");
    const[ textEditor, setTextEditor ] = useState({ isReady: false });
    const [bannerURL, setBannerURL] = useState("");

    let { userAuth: { access_token } } = useContext(UserContext);

    return (
            <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState, textEditor, setTextEditor, bannerURL, setBannerURL}}>
                {
                    access_token === null 
                    ? <Navigate to="/signin" />
                    : editorState == "editor" ? <BlogEditor/> : <PublishForm />
                }
            </EditorContext.Provider>

    )
}

export default Editor;