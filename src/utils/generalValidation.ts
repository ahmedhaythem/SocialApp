import z from "zod";
import { PostAvailabilityEnum } from "../modules/postModule/post.types";



export const generalValidation={
    content:z.string().optional(),
    files:z.array(z.any()).optional(),
    availability:z.enum([
        PostAvailabilityEnum.PUBLIC,
        PostAvailabilityEnum.PRIVATE,
        PostAvailabilityEnum.FRIENDS
    ]).default(PostAvailabilityEnum.PUBLIC).optional(),
    allowComments:z.boolean().default(true).optional(),
    tags:z.array(z.string()).optional(),
}