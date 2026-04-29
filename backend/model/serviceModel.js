const mongoose = require('mongoose') // Mongoose is the ODM (Object Data Modeling) library that lets us define schemas and interact with MongoDB using JavaScript objects

// Define the shape and rules for documents in the 'notes' collection
const servicesSchema = mongoose.Schema(
  {
    // ---- Relationship Field ----------------------------------------------
    // Every service must belong to a user. Instead of duplicating user data,
    // we store a reference (foreign key equivalent) to the User document.
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      // ObjectId is MongoDB's built-in unique ID type — links this note to a specific User document
      
      required: true,                       
      // A note cannot exist without an owner
      
      ref: 'User',                          
      // Tells Mongoose which model this ObjectId points to — enables .populate('user') to fetch full user data in queries
    },

    // ---- Service Content ----------------------------------------------
    id: {
      type: Number,
      required: [true, 'Please add a id value'], // Second element is a custom error message returned when validation fails
    },
     service_title: {
      type: String,
      required: [true, 'Please add a service_title value'], // Second element is a custom error message returned when validation fails
    },
     price: {
      type: Number,
      required: [true, 'Please add a price value'], // Second element is a custom error message returned when validation fails
    },
     discount: {
      type: Boolean,
      required: [true, 'Please add a discount value'], // Second element is a custom error message returned when validation fails
    },
    duration: {
      type: Number,
      required: [true, 'Please add a duration value'], // Second element is a custom error message returned when validation fails
    },
    description: {
      type: String,
      required: [true, 'Please add a description value'], // Second element is a custom error message returned when validation fails
    },
    username: {
      type: String,
      required: [true, 'Please add a username']
    }
  },

  // ---- Schema Options ----------------------------------------------
  {
    timestamps: true, // Automatically adds and manages `createdAt` and `updatedAt` fields on every document
    //  — no need to set them manually
  }
)

// Compile the schema into a Model and export it.
// Mongoose will map this to a MongoDB collection named 'notes' (lowercased + pluralized automatically).
// Other files import this to query, create, update, or delete notes: e.g. await Note.create({...})
module.exports = mongoose.model('Service', servicesSchema)