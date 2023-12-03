const Listing = require('../models/listing.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapToken = process.env.MAP_TOKEN
const geoCodingClient = mbxGeocoding({ accessToken: mapToken })

//Index Route
module.exports.index = async (req, res, next) => {
  const allListings = await Listing.find({})
  res.render('./listings/index.ejs', { allListings })
}

//Createa Listing Form
module.exports.renderNewForm = async (req, res, next) => {
  await res.render('./listings/new.ejs')
}

//Show Listing
module.exports.showListing = async (req, res, next) => {
  let { id } = req.params
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: { path: 'author' },
    })
    .populate('owner')
  if (!listing) {
    req.flash('error', 'Listing you looking for does not exist')
    res.redirect('/listings')
  }
  res.render('./listings/show.ejs', { listing })
}

//Create Listing
module.exports.createListing = async (req, res, next) => {
  let response = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 2,
    })
    .send()
  console.log(response.body.features[0].geometry.coordinates)
  const url = req.file.path
  const filename = req.file.filename
  const newListing = new Listing(req.body.listing)
  newListing.image = { url, filename }
  newListing.owner = req.user._id
  newListing.geometry = response.body.features[0].geometry
  await newListing.save()
  req.flash('success', 'New Listing Added Successfully')
  res.redirect('/listings')
}

//Edit Listing
module.exports.editListing = async (req, res, next) => {
  let { id } = req.params
  const listing = await Listing.findById(id)
  if (!listing) {
    req.flash('error', 'Listing you looking for does not exist')
    res.redirect('/listings')
  }
  let originalUrl = listing.image.url
  originalUrl = originalUrl.replace('upload', 'upload/w_250,h_250,c_fill')
  res.render('./listings/edit.ejs', { listing, originalUrl })
}

//Update Listing
module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing })
  let response = await geoCodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 2,
    })
    .send()
  if (typeof req.file !== 'undefined') {
    const url = req.file.path
    const filename = req.file.filename
    listing.image = { url, filename }
  }
  listing.geometry = response.body.features[0].geometry
  await listing.save()

  req.flash('success', 'Listing Updated Successfully')
  res.redirect(`/listings/${id}`)
}

//Delete Listing
module.exports.deleteListing = async (req, res, next) => {
  let { id } = req.params
  await Listing.findByIdAndDelete(id)
  req.flash('success', 'Listing Deleted Successfully')
  res.redirect('/listings')
}
