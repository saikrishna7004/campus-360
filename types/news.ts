export interface NewsItem {
    _id: string;
    title: string;
    content: string;
    image?: string;
    isBanner?: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
