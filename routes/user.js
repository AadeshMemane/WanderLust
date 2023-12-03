const express = require('express')
const router = express.Router({ mergeParams: true })
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport')
const { saveRedirectUrl } = require('../middleware.js')
const userController = require('../controllers/users.js')

//SignUp Route
router
  .route('/signup')
  .get(async (req, res) => {
    res.render('./user/signup.ejs')
  })
  .post(wrapAsync(userController.signUp))

//SignIn Route
router
  .route('/signin')
  .get(userController.renderSignUp)
  .post(
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: '/signin',
      failureFlash: true,
    }),
    wrapAsync(userController.signIn)
  )

//LogOut Route
router.get('/logout', userController.logOut)

module.exports = router
