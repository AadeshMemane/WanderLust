if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const expressError = require('./utils/expressError.js')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStratergy = require('passport-local')
const User = require('./models/user.js')

//ROUTER
const listingRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/reviews.js')
const userRouter = require('./routes/user.js')

//MONGODB
const dbUrl = process.env.MONGO_ATLAS_URL
async function main() {
  await mongoose.connect(dbUrl)
}

main()
  .then(() => {
    console.log('connected to DB')
  })
  .catch((err) => {
    console.log(err)
  })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, './public')))

//MONGO-Based Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SECRET,
  },
})

store.on('error', () => {
  console.log('ERROR IN MONGODB SESSION STORE')
})

//EXPRESS SESSION Code
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}

app.use(session(sessionOptions))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStratergy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//EXPRESS-SESSION
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  res.locals.currUser = req.user
  next()
})

//ROUTES
app.use('/listings', listingRouter)
app.use('/listings/:id/reviews', reviewRouter)
app.use('/', userRouter)

app.listen(8080, (req, res) => {
  console.log('Listening on port : 8080')
})

// app.get('/', (req, res) => {
//   res.send('This is root')
// })

// ERROR
app.all('*', (req, res, next) => {
  next(new expressError(404, 'Page NOt Found!'))
})

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'Something Went Wrong' } = err
  res.status(statusCode).render('error.ejs', { message })
})
