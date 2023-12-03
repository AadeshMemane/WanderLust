const expressError = require('./utils/expressError.js')
const { listingSchema, reviewSchema } = require('./schema.js')
const Listing = require('./models/listing.js')
const Review = require('./models/review.js')

//VALIDATE ERROR HANDLING MIDDLEWARE
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body)
  if (error) {
    let errMSg = error.details.map((el) => el.message).join(',')
    throw new expressError(400, errMSg)
  } else {
    next()
  }
}

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body)
  if (error) {
    let errMSg = error.details.map((el) => el.message).join(',')
    throw new expressError(400, errMSg)
  } else {
    next()
  }
}

//Checking User Loggin or not
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl
    req.flash('error', 'You must be loogen in first!')
    res.redirect('/signin')
  }
  next()
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl
  }
  next()
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params
  let listing = await Listing.findById(id)
  if (
    res.locals.currUser &&
    !listing.owner._id.equals(res.locals.currUser._id)
  ) {
    req.flash('error', 'You dont have permission to edit')
    return res.redirect(`/listings/${id}`)
  }
  next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId } = req.params
  let { id } = req.params
  let review = await Review.findById(reviewId)
  if (
    res.locals.currUser &&
    !review.author._id.equals(res.locals.currUser._id)
  ) {
    req.flash('error', 'You dont have permission to edit')
    return res.redirect(`/listings/${id}`)
  }
  next()
}
