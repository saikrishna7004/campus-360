import React, { useEffect, useState } from 'react';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';

const OrderUpdates = () => {
    const { fetchNewOrders } = useOrderStore();
    const { getAuthHeader } = useAuthStore();

    useEffect(() => {
        const interval = setInterval(async () => {
            const authHeader = getAuthHeader();
            const newOrders = await fetchNewOrders(authHeader);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return null;
};

export default OrderUpdates;