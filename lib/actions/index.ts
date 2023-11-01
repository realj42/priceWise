"use server"

import {revalidatePath} from "next/cache";
import {scrapeAmazonProduct} from "@/lib/scraper";
import {connectToDB} from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {getAveragePrice, getHighestPrice, getLowestPrice} from "@/lib/utils";
import {User} from "@/types";
import {generateEmailBody, sendEmail} from "@/lib/nodemailer";


export async function scrapeAndStoreProduct(productURL: string) {
    if (!productURL) return;
    try {
        await connectToDB();

        const scrapedProduct = await scrapeAmazonProduct(productURL);
        if (!scrapedProduct) return;

        let product = scrapedProduct;
        const existingProduct = await Product.findOne({url: scrapedProduct.url})

        if (existingProduct) {
            const updatedPriceHistory = [ ...existingProduct.priceHistory,
                {price: scrapedProduct.currentPrice}
            ];
            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url},
            product,
            { upsert: true, new: true}
        );
        revalidatePath(`/products/${newProduct._id}`)

    } catch (err: any) {
        throw new Error(  `Failed to create/update product: ${err.message}` );
    }

}

export async function getProductById(productId: string) {
    try {
        await connectToDB();
        return await Product.findOne({_id: productId});
    } catch (err) {
        console.log( err );
    }
}

export async function getAllProducts() {
    try {
        await connectToDB();
        return await Product.find();
    } catch (err) {
        console.log(err);
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        await connectToDB();
        console.log('Product ID: ', productId, '\n' );
        if (!productId) return null;
        if (! await  Product.findById(productId)) return null; // Check product does exist first
        return await Product.find({
            _id: {$ne: productId}
        }).limit(3);
    } catch (err) {
        console.log(err);
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        // send email
        console.log('Product ID: ', productId);
        const product = await Product.findById(productId);
        if (!product) return;

        const userExists = product.users.some((user: User) => user.email === userEmail);
        console.log('User exists? : ', userExists);
        if (!userExists) {
            product.users.push({ email: userEmail});
            await product.save();
            const emailContent = await generateEmailBody(product, 'WELCOME');
            await sendEmail(emailContent, [userEmail]);

        }



    } catch (e) {
        console.log(e);
    }
}