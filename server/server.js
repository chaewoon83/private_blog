//access to .env file
import 'dotenv/config'
import express from 'express';
//access to mongodb
import mongoose from 'mongoose';
//encrypt password
import bcrypt from 'bcrypt';
//avoid duplicated id
import { nanoid } from 'nanoid';
//generate token to check user access is valid
import jwt from 'jsonwebtoken';
//accept request from other port
import cors from 'cors';
//use firebase to auth access token
import admin from 'firebase-admin';
//firebase keys
import serviceAccountKey from "./private-blog-41137-firebase-adminsdk-zshr2-dfd3d47ed9.json" with { type: "json" };
//connect with aws
import aws from "aws-sdk";

import { getAuth } from "firebase-admin/auth";

// schema below
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';

const server = express();
let PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
});

//setting up s3 bucket
const s3 = new aws.S3({
    region: 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'private-blog-protfolio',
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
}

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // when authHeader is empty, token is null
    if (token == null) {
        return res.status(401).json({ "error": "No access token" })
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ "error": "Access token is invlid" });
        }

        req.user = user.id;
        next();
    })
}

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result)

    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
}

server.post('/latest-blogs', (req, res) => {

    let { page } = req.body;

    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => res.status(200).json({ blogs }))
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        })
})

server.post("/all-latest-blogs-count", (req, res) => {

    Blog.countDocuments({ draft: false })
        .then(count =>
            res.status(200).json({ totalDocs: count })
        )
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ "error": err.message });
        }
        )

})

server.get('/get-upload-url', (req, res) => {

    generateUploadURL()
        .then(url => res.status(200).json({ uploadURL: url }))
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        })
})

server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;

    // validating the data from frontend
    if (fullname.length < 3) {
        //403 means invalidatioin
        return res.status(403).json({ "error": "Fullname must be at least 3 letters long" })
    }

    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" })
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Email is invalid" })
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be 6 to 20 characters long with a nmeric, 1 lowercase and 1 uppercase letters" })
    }
    bcrypt.hash(password, 10, async (err, hased_password) => {

        let username = await generateUsername(email);

        let user = new User({
            personal_info: {
                fullname, email, password: hased_password, username
            }
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
            .catch(err => {
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "email already exists" });
                }
                return res.status(500).json({ "error": err.message })
            })
    });

})

server.post("/signin", (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }

            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({ "error": "Error occured while login please try again" });
                    }
                    if (!result) {
                        return res.status("403").json({ "error": "Incorrect password" });
                    }
                    else {
                        return res.status("200").json(formatDatatoSend(user));
                    }
                });
            }
            else {
                return res.status(403).json({ "error": "Account was created using google. Try logging in with Google" });
            }
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ "error": err.message });
        });

})

server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;
    console.log(access_token);
    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;
            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((u) => {
                    return u || null;
                })
                .catch(err => {
                    return res.status(500).json({ "error": err.message });
                })

            //login
            if (user) {
                console.log(user);
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without google. Please log in with password to access the account" });
                }
            }
            else { // sign up
                let username = await generateUsername(email);
                user = new User({
                    personal_info: { fullname: name, email, profile_img: picture, username },
                    google_auth: true
                })

                await user.save().then((u) => {
                    user = u;
                })
                    .catch(err => {
                        return res.status(500).json({ "error": err.message });
                    })
            }
            return res.status(200).json(formatDatatoSend(user));
        }
        )
        .catch(err => {
            return res.status(500).json({ "error": "Failed to authenticate you with google. Try with some other google account" })
        }
        )
})

server.post("/all-search-blogs-count", (req, res) => {

    let { tag, query } = req.body;
    let findQuery;
    //if seaching by tag set query
    if (tag) {
        findQuery = { tags: tag, draft: false };
    }
    //if seaching by query set query
    else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') };
    }


    Blog.countDocuments(findQuery)
        .then(count =>
            res.status(200).json({ totalDocs: count })
        )
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ "error": err.message });
        }
        )
})

server.post("/search-blogs", (req, res) => {

    let { tag, query, page, author, limit, eliminate_blog } = req.body;
    let findQuery;
    //if seaching by tag set query
    if (tag) {
        findQuery = { tags: { $in: [tag] }, draft: false, blog_id: { $ne: eliminate_blog } };
    }
    //if seaching by query set query
    else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') };
    }
    else if (author) {
        findQuery = { author, draft: false };
    }


    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs =>
            res.status(200).json({ blogs })
        )
        .catch(err =>
            res.status(500).json({ "error": err.message })
        )

})

server.post("/search-users", (req, res) => {
    let { query } = req.body;
    let maxLimit = 50;

    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(maxLimit)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users =>
            res.status(200).json({ users })
        )
        .catch(err =>
            res.status(500).json({ "error": err.message })
        )
})

server.post("/get-profile", (req, res) => {

    let { username } = req.body;
    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user =>
            res.status(200).json(user)
        )
        .catch(err => {
            console.log(err)
            res.status(500).json({ "error": err.message })
        })

})

server.post("/create-blog", verifyJWT, (req, res) => {

    let authorId = req.user;

    let { title, des, banner, tags, content, draft, id } = req.body;

    if (!title.length) {
        return res.status(403).json({ "error": "You must provide a title to publish the blog" });
    }

    if (!draft) {
        //content validation
        if (!des.length || des.length > 200) {
            return res.status(403).json({ "error": "You must provide blog description under 200 characters" });
        }

        if (!banner.length) {
            return res.status(403).json({ "error": "You must provide blog banner to publish it" });
        }

        if (!content.blocks.length) {
            return res.status(403).json({ "error": "You must provide some blog content to publish it" });
        }

        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ "error": "You must provide tags to publish it" });
        }
    }

    //make tag names lowercase to catagorize the tags
    tags = tags.map(tag => tag.toLowerCase());

    //generate blog id (replace special character to - and add random strings)
    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if (id) {
        Blog.findOneAndUpdate({ blog_id: blog_id }, {title, des, banner, content, tags, draft: draft ? draft : false})
        .then(user => {
            return res.status(200).json({ id: blog_id });
        })
        .catch(err =>
            res.status(500).json({ "error": err.message })
        );
    }
    else {
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)

        })

        blog.save().then(blog => {

            let incrementVal = draft ? 0 : 1;

            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
                .then(user => {
                    return res.status(200).json({ id: blog.blog_id });
                })
                .catch(err => {
                    return res.status(500).json({ "error": "Failed to update total posts number" });
                });
        })
            .catch(err =>
                res.status(500).json({ "error": err.message })
            );
    }


})

server.get("/trending-blogs", (req, res) => {

    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(maxLimit)
        .then(blogs =>
            res.status(200).json({ blogs })
        )
        .catch(err =>
            res.status(500).json({ "error": err.message })
        )
})

server.post("/get-blog", (req, res) => {

    let { blog_id, draft, mode } = req.body;

    let incrementVal = mode != "edit" ? 1 : 0;

    Blog.findOneAndUpdate({ blog_id: blog_id }, { $inc: { "activity.total_reads": incrementVal } })
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img account_info.total_reads")
        .select("title draft des content banner activity publishedAt blog_id tags")
        .then(async (blog) => {

            if (blog.draft && !draft) {
                return res.status(500).json({ "error": "you cannot access draft blogs" });
            }

            await User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, { $inc: { "account_info.total_reads": incrementVal } })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ "error": err.message });
                })



            return res.status(200).json({ blog });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ "error": err.message })
        })

})

server.post("/like-blog", verifyJWT, (req, res) => {
    let user_id = req.user;
    let {_id, isLikedByUser} = req.body;

    let incrementVal = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
    .then((blog) => {
        if(!isLikedByUser){
            let like = new Notification({
                type : "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
                })
            like.save().then(notification => {
                return res.status(200).json({liked_by_user: true});
            })
        }

        else{

            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({liked_by_user: false});
            })
            .catch(err =>
                res.status(500).json(err)
            )

        }
    })
})

server.post("/isliked-by-user", verifyJWT, (req, res) => {
    let user_id = req.user;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id})
    .then(result => {
        return res.status(200).json({ result });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message});
    })
})

server.post("/add-comment", verifyJWT, (req,res)=> {
    let user_id = req.user;

    let{_id, comment, blog_author } = req.body;

    if(!comment.length){
        return res.status(403).json({error: 'Write something to leave a comment'});
    }

    //creating a commnet doc
    let commentObj = new Comment({
        blog_id: _id, blog_author, comment, commented_by: user_id,
    })

    commentObj.save().then(commentFile => {
        let { comment, commentedAt, children } = commentFile;
        //$push to add comment to blog object's comment array
        Blog.findOneAndUpdate({ _id },     { 
            $push: { "comments": commentFile._id }, 
            $inc: { 
                "activity.total_comments": 1, 
                "activity.total_parent_comments": 1  
            }
        })
        .then(blog=> {console.log('New comment created')});

        let notificationObj = new Notification({
            type: "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        })

        notificationObj.save().then(notification => console.log('new comment notification created'));

        return res.status(200).json({
            comment, commentedAt, _id: commentFile._id, user_id, children
        })
    })
})

server.post("/get-blog-commnets", (req, res) => {

    let {blog_id, skip} = req.body;

    let maxLimit = 5;

    Comment.find({ blog_id, isReply:false })
    .sort({
        'commentedAt' : -1
        //get latest comment first
    })
    .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .then(comment => {
        return res.status(200).json(comment);
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message});
    })

})

server.listen(PORT, () => {
    console.log('listening on port -> ' + PORT)
});
