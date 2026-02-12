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
const API_BASE_URL = "http://localhost:8080/api";
export const getTopRatedDoctors = async (): Promise<Doctor[]> => {
    // Get the token (Adjust this key if you use a different one, e.g., "user_token")
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/doctor/get-top-3-doctors`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch top doctors: ${response.statusText}`);
    }

    // The backend returns a List<DoctorDTO>
    const data: Doctor[] = await response.json();

    return data;
};