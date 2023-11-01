import React from 'react';
import Image from "next/image";
interface Props {
    title: string;
    iconSrc: string;
    value: string;
    borderColour: string;
}

const PriceInfoCard = ({title, iconSrc, value, borderColour} : Props) => {
    return (
        <div className={`price-info_card ${borderColour}`}>
            {/*<p className={'text-base text-black-100'}>{title}</p>*/}
            <div className={'flex gap-1'} title={title}>
                <Image src={iconSrc} alt={title} width={24} height={24} />
                <p className={'text-2xl font-bold text-secondary'}>{value}</p>
            </div>
        </div>
    );
};

export default PriceInfoCard;
