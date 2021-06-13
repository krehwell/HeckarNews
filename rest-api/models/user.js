const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * @property username
 * @property password
 * @property authToken: user login information
 * @property authTokenExpiration: expiration long of user token in UNIX timestamp
 * @property resetPasswordToken: token email sent about reset password information
 * @property resetPasswordTokenExpiration: expiration long of resetPasswordToken is valid
 * @property email
 * @property created: user created date in UNIX timestamp
 * @property karma: user karma, calculated by number of vote user received
 * @property about: user bio
 * @property showDead: option to show/hide item has been killed by moderator
 * @property shadowBanned: user next post will be unshown until mod has taken the shadowBanned
 * @property banned: restrict login attempts for banned users
 */
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

    isModerator: {
        type: Boolean,
        default: false,
    },

    shadowBanned: {
        type: Boolean,
        default: false,
    },

    banned: {
        type: Boolean,
        default: false
    }
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

/**
 * Compare the request password with the current user password
 * @returns true on bcrypt.compareSync(req.password, user.password) is true;
 */
UserSchema.methods.comparePassword = async function (pw) {
    const passwordIsMatch = bcrypt.compareSync(pw, this.password);

    if (passwordIsMatch) {
        return true;
    } else {
        return false;
    }
};

UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
