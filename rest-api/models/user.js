const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    authToken: String,
    authTokenExpiration: Number,
    resetPasswordToken: String,
    resetPasswordTokenExpiration: Number,

    email: {
        type: String,
        lowercase: true,
        default: "",
    },

    created: Number,

    karma: {
        type: Number,
        default: 0,
        min: 0,
    },

    about: {
        type: String,
        default: "",
    },

    showDead: {
        type: Boolean,
        default: false,
    },
});

UserSchema.pre("save", function (next) {
    const user = this;

    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }

                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (pw, cb) {
    bcrypt.compare(pw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });
};

UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
