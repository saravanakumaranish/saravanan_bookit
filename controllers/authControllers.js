import User from "../models/User"
import cloudinary from "cloudinary"

import ErrorHandler from "../utils/errorHandler"
import catchAsyncErrors from "../middlewares/catchAsyncErrors"
import sendEmail from "../utils/sendEmail"

import absoluteUrl from "next-absollute-url"
import crypto from "crypto"

//setting up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Register user => /api/auth/register
const registerUser = catchAsyncErrors(async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "bookit/avatars",
    width: "150",
    crop: "scale",
  })

  const { name, email, password } = req.body

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.url,
    },
  })

  res.status(200).json({
    success: true,
    message: "Account Registered successfully",
  })
})

// current user profile => /api/me

const currentUserProfile = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.status(200).json({
    success: true,
    user,
  })
})

// Update user profile => /api/me/update

const updateProfile = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name
    useremail = req.body.email

    if (req.body.password) user.password = req.body.password
  }

  //Update avatar
  if (req.body.avatar === "") {
    const image_id = user.avatar.public_id

    //Delete user previous image/avatar
    await cloudinary.v2.uploader.destroy(image_id)

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "bookit/avatars",
      width: "150",
      crop: "scale",
    })

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    }
  }

  await user.save()

  res.status(200).json({
    success: true,
  })
})

// Forgot password => /api/password/forgot

const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler("user not found with this email", 404))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  //Get origin
  const { origin } = absoluteUrl(req)

  //create reset password url
  const resetUrl = "${origin}/password/reset/${resetToken}"

  const message =
    "Your password reset url is as follow:\n\n ${resetUrl} \n\n If you have not requested this email,then ignore it."

  try {
    await sendEmail({
      email: user.email,
      subject: "BookIT password Recovery",
      message,
    })
    res.status(200).json({
      success: true,
      message: "Email sent to: ${user.email}",
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }
})

// Reset  password => /api/password/reset/:token

const resetPassword = catchAsyncErrors(async (req, res, next) => {
  //Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    )
  }
  if (req.body.password === req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400))
  }

  //Setup the new Password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  })
})

export { registerUser, currentUserProfile, updateProfile, resetPassword }
