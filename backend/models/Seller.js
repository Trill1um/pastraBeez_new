import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sellerSchema = new mongoose.Schema({
    colonyName: {
        type: String,
        required: [true, 'Colony name is required'],
        trim: true,
        maxlength: 50,
        minlength: 2
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        maxlength: 100,
        minlength: 5,
        match: /.+\@.+\..+/
    }, 
    password: {
        type: String,
        required: [ true, 'Password is required'],
        trim: true,
        maxlength: 1024,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    facebookLink: {
        type: String,
        required: [true, 'Facebook link is required'],
        trim: true,
    }
}, {
    timestamps: true
    }
);

sellerSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.password.startsWith('$2b$')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    } 
});

// Real
// sellerSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }

// Dummy
sellerSchema.methods.comparePassword = async function (password) {
  console.log("Comparing: ", password, this.password);
  const raw = password==this.password;
  const hashed = await bcrypt.compare(password, this.password);
  console.log("Result: raw:", raw, " hashed:", hashed);
    return raw || hashed;
}

const Seller = mongoose.model('DummySeller', sellerSchema);

export default Seller;