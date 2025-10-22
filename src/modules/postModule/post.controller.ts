import { PostServices } from './post.service';
import { Router } from "express";
import * as postValidation from './post.validation';
import { validation } from '../../middleware/validation.middleware';
import multer from "multer";
import { auth } from '../../middleware/auth.middleware';

const upload = multer();
const router=Router()


export const postRoutes= {
    base:"/posts",
    createPost:"/",
    likePost:'/like-unlike'
}

const postservices=new PostServices()


router.post(
    postRoutes.createPost,
    auth(),
    upload.array("attachments"),
    validation(postValidation.createPostSchema),
    postservices.createPost
)

router.patch(
    postRoutes.likePost,
    auth(),
    postservices.likePost
)


export default router