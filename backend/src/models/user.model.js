import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    sendTime: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 9 
    },
    sendMinute: {
        type: Number,
        required: true,
        min: 0,
        max: 59,
        default: 0
    },
    meridiem: {
        type: String,
        required: true,
        enum: ['AM', 'PM'],
        default: 'AM'
    },
    period: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    categories: {
        type: String,
    },
    AiPrompt : {
        type : String,
    }
}, {
    timestamps: true
});

const userModel = mongoose.model("User", userSchema);

export default userModel;