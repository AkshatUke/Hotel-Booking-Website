const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listings.js"); 
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}));

//new route
router.get("/new", isLoggedIn , (req, res) => {
    res.render("listings/new.ejs");
});

//create route
router.post("/", validateListing, isLoggedIn, wrapAsync(async (req, res, next) => {
    const newListing = req.body.listing;
    let { image } = req.body.listing;
    let listing = new Listing(newListing)
    listing.image.url = image;
    await listing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested does not Exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//edit route
router.get("/:id/edit",isOwner , isLoggedIn , wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    if(!listings) {
        req.flash("error", "Listing you requested does not Exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listings });
}));

//update route
router.put("/:id",isOwner ,validateListing, isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title, description, price, image : url, location, country } = req.body.listing;
    let img = { url };
    let listing = {
        title: title,
        description: description,
        image: img,
        price: price,
        location,
        country
    };
    console.log(listing);
    await Listing.findByIdAndUpdate(id, { ...listing });
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
}));

//delete route
router.delete("/:id",isOwner , isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(`Deleted Listing ${deletedListing}`);
    req.flash("success", "Listing Deleated!");
    res.redirect("/listings");
}));

module.exports = router;