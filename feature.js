var debug = require('debug')('rose');
var mongoose = require('mongoose');

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/mydb';
debug('Connecting to MongoDB at ' + mongoURI + '...');
mongoose.connect(mongoURI);

var featureSchema = new mongoose.Schema({
  name: String,
  examples: [{
    technology: String,
    snippets: [String]
  }]
});

featureSchema.statics.search = function (query, callback) {
   this.find({ $or: [
               { name: new RegExp(query, 'i') },
               { examples: { $elemMatch: { technology: new RegExp(query, 'i') }}},
               { examples: { $elemMatch: { snippets: new RegExp(query, 'i') }}}
            ]})
       .lean()
       .select('-__v -_id -examples._id')
       .exec(function (err, docs) {
         callback(docs);
       });
};

module.exports = mongoose.model('Feature', featureSchema);
