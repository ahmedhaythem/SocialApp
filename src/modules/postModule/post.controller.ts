import { PostServices } from './post.service';
import { Router } from "express";
import * as postValidation from './post.validation';
import { validation } from '../../middleware/validation.middleware';
import multer from "multer";
import { auth } from '../../middleware/auth.middleware';
import { uploadFile } from '../../utils/multer/multer';

const upload = multer();
const router=Router()


export const postRoutes= {
    base:"/posts",
    createPost:"/",
    likePost:'/like-unlike',
    updatedPost:"/update-post/:id",
    freezePost:'/freeze/:postId',
    unFreezePost:'/unfreeze/:postId',
    deletePost:'/hard-delete/:postId'


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

router.patch(
    postRoutes.updatedPost,
    auth(),
    uploadFile({}).array('newAttachments',4),
    postservices.updatePost
)

router.patch(
    postRoutes.freezePost,
    auth(), 
    postservices.freezePost
)


router.patch(
    postRoutes.unFreezePost, 
    auth(), 
    postservices.unfreezePost
)

router.delete(
    postRoutes.deletePost,
    auth(), 
    postservices.hardDeletePost
)


export default router