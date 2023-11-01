import axios from "axios";
import * as cheerio from "cheerio"
import {extractCurrency, extractDescription, extractPrice} from "@/lib/utils";
export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    //BrightData configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        // fetch product
        const response = await axios.get(url, options);
        //console.log(response.data);
        const $ = cheerio.load(response.data);
        const title = $('#productTitle').text().trim();
        const currentPriceWhole = extractPrice(
            $('.a-price-whole').first(),
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const currentPriceFraction = extractPrice($('.a-price-fraction').first());
        const currentPriceSymbol  = extractCurrency($('.a-price-symbol').first());
        const currentPrice = currentPriceWhole + currentPriceFraction;

        //console.log($('.a-offscreen').text().trim())
        const originalPrice = extractPrice(
            $('.basisPrice .a-offscreen').first(),
            $('#priceblock_ourprice'),
            $('#listPrice'),
            $('#priceblock_dealblock'),
            $('.a-size-base.a-price .a-offscreen').first()
        );

        const outOfStock = $('#outOfStock span').first().text().trim().toLowerCase() === 'currently unavailable.';
        let availability = 0;
        if (!outOfStock) {
            availability = extractPrice($('#availability span').first()) || 999;
        }
        const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') || '';
        const imageUrls = Object.keys(JSON.parse(images));
        const discountRate = $('.savingsPercentage').first().text().replace(/[-%]/g, '');
        const ratings = extractPrice($('#acrCustomerReviewText').first());
        const stars = $('.AverageCustomerReviews i').text().trim();
        const description = extractDescription($);

       // console.log({title, currentPrice, origPrice: currentPriceSymbol + originalPrice, outOfStock, availability, discountRate, imageUrls });
        const data = {
            url,
            currency: currentPriceSymbol || '£',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [
                {price:  Number(currentPrice) || Number(originalPrice)}
            ],
            discountRate: Number(discountRate),
            isOutOfStock: outOfStock,
            stock: Number(availability),
            category: 'category',
            reviewsCount: Number(ratings),
            stars,
            description,
            lowestPrice:  Number(currentPrice) || Number(originalPrice),
            highestPrice:  Number(originalPrice) || Number(currentPrice),
            averagePrice:   Number(currentPrice) || Number(originalPrice),

        }
        //console.log(data);
        return data;


    } catch (err: any) {
        throw new Error(`Failed to scrape url: ${url} - ${err.message}`)
    }
}