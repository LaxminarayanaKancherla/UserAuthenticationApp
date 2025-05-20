 
export interface User {
    email: string;
    username: string;
    phone: string;
    age: number;
    role: string;
    image?: string; // Optional, as image may be a Base64 string or null
}