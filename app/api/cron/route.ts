import {connectToDB} from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {scrapeAmazonProduct} from "@/lib/scraper";
import {getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice} from "@/lib/utils";
import {revalidatePath} from "next/cache";
import {generateEmailBody, sendEmail} from "@/lib/nodemailer";
import {NextResponse} from "next/server";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDB();
        const products = await Product.find({});
        if (!products) throw new Error("Products not found");
        const updatedProducts = await Promise.all(
          products.map(async (currentProduct) => {
              const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
              if (!scrapedProduct) {
                  // remove product from DB
                  // inform users URL no longer functions
                  throw new Error("Product not found");
              } else {

                  const updatedPriceHistory = [ ...currentProduct.priceHistory,
                      {currentPrice: scrapedProduct.currentPrice}
                  ];
                  let updatedProduct = {
                      ...scrapedProduct,
                      priceHistory: updatedPriceHistory,
                      lowestPrice: getLowestPrice(updatedPriceHistory),
                      highestPrice: getHighestPrice(updatedPriceHistory),
                      averagePrice: getAveragePrice(updatedPriceHistory),
                  }

                  const newProduct = await Product.findOneAndUpdate(
                      { url: scrapedProduct.url},
                      updatedProduct,
                  );
                  //revalidatePath(`/products/${newProduct._id}`)

                  // send emails
                  const emailNotifType = await getEmailNotifType(scrapedProduct,currentProduct);
                  if (emailNotifType && newProduct.users.length > 0) {
                      const productInfo = {
                          title: updatedProduct.title,
                          url: updatedProduct.url,
                      }
                      const emailContent = generateEmailBody(productInfo, emailNotifType);
                      const userEmails = updatedProduct.users.map((user: any) => user.email);
                      await sendEmail(emailContent, userEmails);

                  }
                  return updatedProduct;
              }
          })
        );
        return NextResponse.json({
            message: 'Ok',
            data: updatedProducts
            }
        );

    } catch (e) {
        throw new Error(`Error in CRON GET: ${e}`);
    }
}