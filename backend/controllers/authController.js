const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME + "d",
    });
};

// Send JWT token in response
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const options = {
        expires: new Date(
            Date.now() +
            process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.cookie("jwt", token, options);

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            user,
        },
    });
};

// Cloudinary config
cloudinary.config({
    cloud_name: "c6Eka2VMeuOk7Od0JvHFTCNxzDE", // cloud name
    api_key: "385231413173631",               // api key
    api_secret: "df8dnez80",                  // api secret
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "avatars",
        transformation: [{ width: 150, crop: "scale" }],
    },
});

const upload = multer({ storage }).single("avatar");

// ---------------------- AUTH CONTROLLERS ----------------------

// Register (Sign Up)
exports.signup = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, passwordConfirm, phoneNumber } = req.body;

    const avatarUpload = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const user = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        phoneNumber,
        avatar: {
            public_id: avatarUpload.public_id,
            url: avatarUpload.secure_url,
        },
    });

    createSendToken(user, 200, res);
});

// Login
exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    createSendToken(user, 200, res);
});

// Protect routes (middleware)
exports.protect = catchAsyncErrors(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new ErrorHandler("You are not logged in! Please log in to get access.", 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new ErrorHandler("The user belonging to this token no longer exists.", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new ErrorHandler("User recently changed password! Please log in again.", 401));
    }

    req.user = currentUser;
    next();
});

// Get user profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Update password
exports.updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword, newPasswordConfirm } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        if (!(await user.correctPassword(oldPassword, user.password))) {
            return next(new ErrorHandler("Old password is incorrect", 400));
        }

        user.password = newPassword;
        user.passwordConfirm = newPasswordConfirm;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};

// Update profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;

        await cloudinary.uploader.destroy(imageId);

        const result = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({ success: true });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("There is no user with email address.", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetURL = `${process.env.FRONTEND_URL}/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new ErrorHandler("There was an error sending the email, try again later!", 500)
        );
    }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

// Logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("jwt", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out",
    });
});
