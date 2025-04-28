import mongoose, { Schema } from "mongoose";

export interface iComment {
    comment: string;
    postId: Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId;
}

const commentsSchema = new mongoose.Schema<iComment>({ //סכמת המודל של התגובות
    comment: {
        type: String,
        required: true,
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "posts",
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
}, { timestamps: true }); //הוספת תאריך יצירה ועדכון אוטומטית של התגובה

const commentsModel = mongoose.model<iComment>("comments", commentsSchema);

export default commentsModel;