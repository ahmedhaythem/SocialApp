import { PostServices } from './post.service';
import { Router } from "express";
import * as postValidation from './post.validation';
import { validation } from '../../middleware/validation.middleware';
import multer from "multer";

const upload = multer();
const router=Router()


export const postRoutes= {
    base:"/posts",
    createPost:"/"
}

const postservices=new PostServices()


router.post(
    postRoutes.createPost,
    upload.array("attachments"),
    validation(postValidation.createPostSchema),
    postservices.createPost)

//
export default router