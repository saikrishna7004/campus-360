import useAuthStore from "@/store/authStore";

const fetchWithHeader = async (url: string, method: string = 'GET', body: any = null) => {
    const authHeader = useAuthStore.getState().getAuthHeader();
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...authHeader,
        },
        body: body ? JSON.stringify(body) : null,
    };
    
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export default fetchWithHeader;