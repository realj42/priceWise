import React from 'react';
import {getProductById, getSimilarProducts} from "@/lib/actions";
import {redirect} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from '@/types';
import {formatNumber} from "@/lib/utils";
import PriceInfoCard from "@/components/PriceInfoCard";
import Modal from "@/components/Modal";
import ProductCard from "@/components/ProductCard";

type Props = {
    params: {id: string}
}

const description = "A nice camera\nTakes great pics\nCheap at half the price";
const ProductDetails = async ({params : {id}} : Props) => {
    const product: Product = await getProductById(id);
    const similarProducts = await getSimilarProducts(id);
    if (!product) redirect('/');
    const numStarsArr = product.stars.match(/^\d.\d|\d+|\d+\b|\d+(?=\w)/g);
    const numStars = numStarsArr ? Number(numStarsArr[0]) : 0;
    const approval = Math.floor(numStars * 20);
    return (
        <div className={'product-container'}>
            <div className={'flex gap-28 xl:flex-row flex-col'}>
                <div className={'product-image'}>
                    <Image
                        src={product.image}
                        alt={product.title}
                        width={400}
                        height={400}
                        className={'mx-auto'}
                    />
                </div>
                <div className={'flex-1 flex flex-col'}>
                    <div className={'flex justify-between items-start gap-5 flex-wrap'}>
                        <div className={'flex flex-col gap-3'}>
                            <p className={'text-[20px] text-secondary font-semibold'}>{product.title}</p>
                            <Link href={product.url} target={'_blank'} className={'text-case text-black opacity-50'}>
                                View/Buy on Amazon
                            </Link>
                        </div>
                        <div className={'flex items-center gap-3'}>
                            <div className={'product-hearts'}>
                                <Image
                                    src={'/assets/icons/red-heart.svg'}
                                    alt={'heart'}
                                    width={20}
                                    height={20}
                                />
                                <p className={'text-base font-semibold text-[#D46F77]'}>
                                    {product.reviewsCount} reviews
                                </p>
                                <Image src={'/assets/icons/star.svg'} alt={'star'} height={20} width={20} />
                                <p className={'text-base font-semibold text-[#D46F77]'}>
                                    {product.stars}
                                </p>

                            </div>
                            <div className={'p-2 bg-[#FFF0F0] rounded-10'}>
                                <Image src={'/assets/icons/bookmark.svg'}
                                       alt={'bookmark'}
                                       width={20}
                                       height={20}
                                />
                            </div>
                            <div className={'p-2 bg-[#FFF0F0] rounded-10'}>
                                <Image src={'/assets/icons/share.svg'}
                                       alt={'share'}
                                       width={20}
                                       height={20}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={'product-info'}>
                        <div className={'flex flex-col gap-1'}>
                            <p className={'text-[34px] text-secondary font-bold'}>
                                {product.currency}{formatNumber(product.currentPrice)}
                            </p>
                            <p className={'text-[21px] text-black opacity-50 line-through'}>
                                {product.currency}{formatNumber(product.originalPrice)}
                            </p>
                        </div>
                        <div className={'flex flex-col gap-4'}>
                            <div className={'flex gap-3'}>
                                <div className={'product-stars'}>
                                    <Image src={'/assets/icons/star.svg'} alt={'star'} height={20} width={20} />
                                    <p className={'text-sm text-primary-orange font-semibold'}>
                                        {numStars}
                                    </p>
                                </div>

                                <div className={'product-reviews'}>
                                    <Image src={'/assets/icons/comment.svg'} alt={'comment'} width={16} height={16} />
                                    <p className={'text-sm text-secondary font-semibold'}>
                                        {product.reviewsCount} reviews
                                    </p>
                                </div>
                            </div>
                            <p className={'text-sm text-black opacity-50'}>
                                 <span className={'text-primary-green font-semibold'}>{approval}%</span> of Amazon purchasers recommend this product

                            </p>
                        </div>
                    </div>
                    <div className={'my-7 flex flex-col gap-5'}>
                        <div className={'flex gap-5 flex-wrap '}>
                            <PriceInfoCard
                                title={'Current Price'}
                                iconSrc={'/assets/icons/price-tag.svg'}
                                value={`${product.currency} ${formatNumber(product.currentPrice)}`}
                                borderColour={'border-l-blue-400'}
                            />
                            <PriceInfoCard
                                title={'Average Price'}
                                iconSrc={'/assets/icons/chart.svg'}
                                value={`${product.currency} ${formatNumber(product.averagePrice)}`}
                                borderColour={'border-l-purple-600'}
                            />
                            <PriceInfoCard
                                title={'Highest Price'}
                                iconSrc={'/assets/icons/arrow-up.svg'}
                                value={`${product.currency} ${formatNumber(product.highestPrice)}`}
                                borderColour={'border-l-red-500'}
                            />
                            <PriceInfoCard
                                title={'Lowest Price'}
                                iconSrc={'/assets/icons/arrow-down.svg'}
                                value={`${product.currency} ${formatNumber(product.lowestPrice)}`}
                                borderColour={'border-l-green-500'}
                            />
                        </div>
                    </div>
                    <Modal  productId={id}/>
                </div>
            </div>
            <div className={'flex flex-col gap-16'}>
                <div className={'flex flex-col gap-5'}>
                    <h3 className={'text-2xl text-secondary font-semibold'}>
                        Key Features
                    </h3>
                    <div className={'flex flex-col gap-1'}>
                            {description?.split('\n').map(line => {
                               return  <p className={'px-5'} key={line}>{line}</p>
                            }) }
                    </div>
                </div>
                <button className={'btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]'}>
                    <Image src={'/assets/icons/bag.svg'} alt={'shopping bag'} width={22} height={22} />
                    <Link href={'/'} className={'text-base text-white'}>
                        Buy Now
                    </Link>
                </button>
            </div>
            {similarProducts && similarProducts.length > 0 && (
              <div className={'py-14 flex flex-col gap-2 w-full'}>
                  <p className={'section-text'}>Similar products</p>
                  <div className={'flex flex-wrap gap-10 mt-7 w-full'}>
                      {similarProducts.map( product => (
                          <ProductCard product={ product } key={ product._id} />
                      ))}
                  </div>

              </div>
            )}
        </div>
    );
};

export default ProductDetails;
