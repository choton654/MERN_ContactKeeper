const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoUri');

const connectDb = () => {
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log('mongodb connected'))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
};

module.exports = connectDb;
