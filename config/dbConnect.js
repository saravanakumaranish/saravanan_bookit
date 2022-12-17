const mongoose = require("mongoose")

const dbConnect = () => {
  if (mongoose.connection.readystate >= 1) {
    return
  }

  mongoose.connect(process.env.NEXT_PUBLIC_DB_LOCAL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

module.exports = dbConnect
