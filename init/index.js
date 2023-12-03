const mongoose = require('mongoose')
const initData = require('../init/data.js')
const Listing = require('../models/listing.js')
const MONGO_URL = 'mongodb://127.0.0.1/wanderlust'

main()
  .then(() => {
    console.log('connected to DB')
  })
  .catch((err) => {
    console.log(err)
  })

async function main() {
  await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
  await Listing.deleteMany({})
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '6561ecd40450c3a2a32b24eb',
  }))
  await Listing.insertMany(initData.data)
  console.log('Data was initialised')
}

initDB()
