import { Href } from "expo-router";

type HomeMenuOptions = {
    name: string;
    icon: string;
    color: string;
    url: Href;
}

export const VENDOR_NAMES: Record<string, string> = {
    'canteen': 'Canteen',
    'stationery': 'Stationery',
    'default': 'Campus Store'
};

export const studentOptions: Record<string, HomeMenuOptions> = {
    canteen: {
        name: 'Canteen',
        icon: 'https://icons.veryicon.com/png/o/object/downstairs-buffet/canteen-1.png',
        color: '#1E3A8A',
        url: '/canteen',
    },
    stationery: {
        name: 'Stationery',
        icon: 'https://icons.veryicon.com/png/o/education-technology/multicolor-education-icon2/stationery-20.png',
        color: '#1E3A8A',
        url: '/stationery',
    },
    library: {
        name: 'Library',
        icon: 'https://icons.veryicon.com/png/o/miscellaneous/color-icon-library/library-126.png',
        color: '#1E3A8A',
        url: '/library',
    },
    office: {
        name: 'Office',
        icon: 'https://cdn-icons-png.flaticon.com/512/3033/3033337.png',
        color: '#1E3A8A',
        url: '/office',
    }
};

export const vendorOptions: Record<string, HomeMenuOptions> = {
    vendor: {
        name: 'Vendor',
        icon: 'https://cdn-icons-png.flaticon.com/512/4990/4990829.png',
        color: '#1E3A8A',
        url: '/admin/dashboard',
    }
};
export const adminOptions: Record<string, HomeMenuOptions> = {
    admin: {
        name: 'Admin',
        icon: 'https://cdn-icons-png.flaticon.com/512/8644/8644456.png',
        color: '#1E3A8A',
        url: '/admin/dashboard',
    },
    news: {
        name: 'News',
        icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
        color: '#1E3A8A',
        url: '/admin/news',
    }
};