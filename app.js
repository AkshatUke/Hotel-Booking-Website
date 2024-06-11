const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../MajorProject/models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main().then(() => {
    console.log("Connection Succesfull");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
    res.send("Hi I am root");
});

//index route
app.get("/listings", async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
});

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//create route
app.post("/listings", async (req, res) => {
    let {title, description, price, filename, url, location, country} = req.body;
    let image = {filename, url};
    let listing = {title: title, 
        description: description, 
        image: image, 
        price: price, 
        location, 
        country
    };
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
    // let listing = req.body.listing;
});

//show route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//edit route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", {listings});
});

//update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let {title, description, price, filename, url, location, country} = req.body;
    let image = {filename, url};
    let listing = {title: title, 
        description: description, 
        image: {filename, url}, 
        price: price, 
        location, 
        country
    };
    const newListing = new Listing(listing);
    await Listing.findByIdAndUpdate(id, {...listing});
    res.redirect("/listings");
});

//delete route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(`Deleted Listing ${deletedListing}`);
    res.redirect("/listings");
});

// app.get("/TestListings", async (req, res) => {
//     let sampleListings = new Listing({
//         title: "My Home",
//         discription: "New City",
//         price: 12000,
//         location: "New York City",
//         country: "London",
//     });

//     await sampleListings.save();
//     console.log("Sample was Saved");
//     res.send("Succesfull");
// });

app.listen(8080, () => {
    console.log("Server is Listening to 8080 port");
});