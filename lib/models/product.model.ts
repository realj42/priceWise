import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
   url: {type: String, required: true, unique: true},
    currency: {type: String, required: true},
    image: {type: String, required: true},
    title: {type: String, required: true},
    currentPrice: {type: Number, required: true},
    originalPrice: {type: Number, required: true},
    priceHistory: [
        {
            price: {type: Number, required: true},
            date: {type: Date, default: Date.now()}
        }
    ],
    lowestPrice: {type: Number}, //derivable from priceHistory
    highestPrice: {type: Number}, //derivable from priceHistory
    averagePrice: {type: Number}, //derivable from priceHistory
    discountRate: {type: Number}, //only current discount rate right?
    description: {type: String},
    category: {type: String},
    reviewsCount: {type: Number},
    stars:  {type: String},
    isOutOfStock: {type: Boolean, default: false},
    stock: {type: Number},
    users: [
        {email: {type: String, required: true}},
    ], default: [],
}, {timestamps: true});

const  Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;