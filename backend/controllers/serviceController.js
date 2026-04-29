 
const asyncHandler = require('express-async-handler')
 
const Service = require('../model/serviceModel')
const User = require('../model/userModel') // for update and delete

// http://localhost:5555/api/notes/
const getServices = asyncHandler(async (req, res) =>{
  
  
    const services = await Service.find({})
 
    res.status(200).json(services)
})

// ===== CREATE A Service =====
const setService = asyncHandler(async(req, res) => {

    // Validate that the request body contains a 'text' field 
    //  without this check, we'd save empty/useless notes to the database
    if(!req.body.service_title){
        // Set status to 400 (Bad Request) 
        //  tells the client they sent invalid data
        res.status(400)
        // Throw an error with a helpful message 
        //  asyncHandler catches this and passes it to our errorMiddleware
        throw new  Error("Please add a 'title' field. ")
    }


    // Insert a new note document into MongoDB 
    //  .create() both builds and saves the document in one step
    const service_created = await Service.create(
        {
            // Set the text field to whatever the client sent in the request body
            id: req.body.id,
            service_title: req.body.service_title,
            price: req.body.price,
            discount: req.body.discount,
            duration: req.body.duration,
            description: req.body.description,
            user: req.user.id,
            username: req.user.name     // adding which user created the note
            
        }
    )

    // Send back the newly created service as JSON 
    //  the client gets confirmation of what was saved, 
    // including the auto-generated _id
    res.status(200).json(service_created)
})

// ===== UPDATE A Service =====
const updateService =  asyncHandler(async(req, res) => {

    // if we need to update any note - we need an id
    // Look up the note by the id from the URL parameter (e.g., /api/notes/abc123) 
    //  we first check if it exists before trying to update
    const service = await Service.findById(req.params.id) // this will find our note

    // If no note was found with that id, send a 400 error 
    //  prevents updating a non-existent document
    if(!service){
        res.status(400)
        throw new Error("service not found")
    }

    //-------Only authorized user can update their services---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their notes
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // Only the services that belong to the user should be modified by that user.
    if (service.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------------------


    // now lets update the note 
    // Find the note by id and update its fields in one operation
    const updatedService = await Service.findByIdAndUpdate(
        req.params.id,          // which note to update
        {
            service_title: req.body.service_title,  // the new data to apply
            price: req.body.price,
            discount: req.body.discount,
            duration: req.body.duration,
            description: req.body.description},
        {new: true}             // return the updated document instead of the old one 
        //  without this, Mongoose returns the document as it was BEFORE the update
    )

    // Send back the updated note so the client can see the changes took effect
    res.status(200).json(updatedService)
})

// ===== DELETE A NOTE =====
const deleteService = asyncHandler(async (req, res) => {

    // Find the note first 
    //  we need the document object to call .deleteOne() on it
    const service = await Service.findById(req.params.id) // this will find our note

    // If the note doesn't exist, tell the client 
    //  prevents trying to delete something that's already gone
    if(!service){
        res.status(400)
        throw new Error("Service not found")
    }


    //-------Only authorized user can update their note ---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their notes
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // check if the note has the user field, because we are adding the user key in the database
    if (service.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------

    // Remove the note from the database 
    //  .deleteOne() is called on the document instance we found above
    await service.deleteOne()

    // Send back a confirmation message with the deleted note's id 
    //  lets the client know which note was removed
    res.status(200).json({ message: `Delete service ${req.params.id}` })
}
)

// Export all four functions so noteRoutes.js can attach them to the corresponding HTTP endpoints
module.exports = {
    getServices,
    setService,
    updateService,
    deleteService
}