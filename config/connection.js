const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_SRV || "mongodb+srv://gstkanotice2024:CbuEhl7i2rcsb6AF@gstkanotice.wgqfcmz.mongodb.net/?retryWrites=true&w=majority")
    .then((e)=> console.log(`Connected to mongoDB:${e.connection.host}`))
    .catch((e)=>console.log(e));