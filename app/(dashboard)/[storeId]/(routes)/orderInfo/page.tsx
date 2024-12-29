import { Order } from '@prisma/client';
import React from 'react';

interface OrderInfoPageProps {
    data: Order[]
}

const OrderInfoPage: React.FC<OrderInfoPageProps> = ({data}) => {
    return (
        <div>
            
        </div>
    );
};

export default OrderInfoPage;