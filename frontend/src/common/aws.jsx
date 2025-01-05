import axios from "axios";

export const uploadImage= async (img) => {

    let imageURL = null;
    let upload_URL = null;

    await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
    .then( async ({data: {uploadURL}})=> {
        await axios.put(uploadURL, img, {
            headers: { 'Content-Type': 'image/jpeg' }})
        upload_URL = uploadURL;
    })
    .then(()=> {
        imageURL = upload_URL.split("?")[0];
    })

    return imageURL;

}