const express = require('express')
const router = express.Router({ mergeParams: true })
const multer = require('multer')
const wrapAsync = require('../utils/wrapAsync.js')
const {
  validateListing,
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
} = require('../middleware.js')
const listingController = require('../controllers/listings.js')

const { storage } = require('../cloudConfig.js')
const upload = multer({ storage })

//Index Route //Post Route
router
  .route('/')
  .get(wrapAsync(listingController.index))
  .post(
    upload.single('listing[image]'),
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing)
  )

//Create Route
router.get('/new', isLoggedIn, wrapAsync(listingController.renderNewForm))

//Show Route //update Route //DELETE ROUTE
router
  .route('/:id')
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    saveRedirectUrl,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))

//Edit Route
router.get(
  '/:id/edit',
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  wrapAsync(listingController.editListing)
)

module.exports = router
