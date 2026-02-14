export type Doctor = {
    id: string;
    fullName: string;
    speciality: string;
    bio: string;
    city: string;
    priceMinCents: number;
    priceMaxCents: number;
    verified: boolean;
    ratingAvg: number;
    ratingCount: number;
}