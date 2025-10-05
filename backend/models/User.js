import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    colonyName: {
      type: String,
      trim: true,
      maxlength: 50,
      minlength: 2,
      required: function() {
        return this.role === 'seller';
      }
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      maxlength: 100,
      minlength: 5,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      maxlength: 1024,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    facebookLink: {
      type: String,
      trim: true,
      required: function() {
        return this.role === 'seller';
      }
    },
    role: {
      type: String,
      enum: ["seller", "buyer"],
      default: "buyer",
    },
    code: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.password.startsWith("$2b$")) {
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

userSchema.methods.comparePassword = async function (password) {
  const hashed = await bcrypt.compare(password, this.password);
  return hashed;
};

const User = mongoose.model("User", userSchema);
const tempUser=mongoose.model("tempUser", userSchema);

tempUser.collection.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 60 * 20 } ); // 20 minutes

export { User, tempUser};