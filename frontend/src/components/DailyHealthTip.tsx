import { useMemo } from "react";

// A curated list of 30 medical-grade tips (one for each day of the month loop)
const HEALTH_TIPS = [
    { id: 1, icon: "💧", category: "Hydration", text: "Drinking 500ml of water before a meal can boost metabolism by 24-30%." },
    { id: 2, icon: "😴", category: "Sleep", text: "Sleeping less than 6 hours a night increases stroke risk by 4x compared to 7-8 hours." },
    { id: 3, icon: "🧠", category: "Mental Health", text: "A 10-minute walk can be as effective as a 45-minute workout for anxiety relief." },
    { id: 4, icon: "👀", category: "Eye Care", text: "Follow the 20-20-20 rule: Every 20 mins, look at something 20 feet away for 20 seconds." },
    { id: 5, icon: "🥗", category: "Nutrition", text: "Dark leafy greens like spinach contain more Vitamin C than oranges." },
    { id: 6, icon: "❤️", category: "Heart Health", text: "Laughing expands blood vessels and increases blood flow, protecting against heart attack." },
    { id: 7, icon: "🦷", category: "Oral Health", text: "Flossing once a day can add up to 6 years to your life expectancy." },
    { id: 8, icon: "☀️", category: "Vitamin D", text: "15 minutes of sunlight per day is sufficient to maintain healthy Vitamin D levels." },
    { id: 9, icon: "🏃", category: "Movement", text: "Sitting for more than 3 hours at a time can decrease life expectancy by 2 years." },
    { id: 10, icon: "🧘", category: "Stress", text: "Deep breathing for 2 minutes can lower cortisol levels instantly." },
    { id: 11, icon: "🍎", category: "Nutrition", text: "Eating an apple a day can lower bad cholesterol by up to 40%." },
    { id: 12, icon: "🦵", category: "Joints", text: "Losing just 1 pound of weight relieves 4 pounds of pressure on your knees." },
    { id: 13, icon: "☕", category: "Caffeine", text: "Limit coffee to before 2 PM to ensure it doesn't disrupt your deep sleep cycle." },
    { id: 14, icon: "📵", category: "Digital Detox", text: "Avoiding screens 1 hour before bed increases melatonin production for better sleep." },
    { id: 15, icon: "🥜", category: "Brain Food", text: "Walnuts are rich in omega-3 fatty acids, which improve cognitive function and memory." },
    { id: 16, icon: "👃", category: "Immunity", text: "Breathing through your nose filters 98% of bacteria compared to mouth breathing." },
    { id: 17, icon: "🥑", category: "Skin Health", text: "Healthy fats in avocados help keep skin flexible and moisturized from the inside out." },
    { id: 18, icon: "🏋️", category: "Strength", text: "Muscle mass naturally decreases after age 30; resistance training reverses this process." },
    { id: 19, icon: "🍌", category: "Blood Pressure", text: "Potassium-rich foods like bananas help lower blood pressure by counteracting sodium." },
    { id: 20, icon: "🦠", category: "Gut Health", text: "Fermented foods like yogurt and kimchi introduce beneficial bacteria to your digestive system." },
    { id: 21, icon: "🍫", category: "Mood", text: "Dark chocolate (70% cocoa) stimulates the production of endorphins, the 'feel-good' chemicals." },
    { id: 22, icon: "🧼", category: "Hygiene", text: "Washing hands for 20 seconds reduces respiratory illnesses by 20% in the general population." },
    { id: 23, icon: "🧴", category: "Sun Safety", text: "Sunscreen needs to be reapplied every 2 hours to maintain effectiveness against UV rays." },
    { id: 24, icon: "🛌", category: "Posture", text: "Sleeping on your back with a pillow under your knees is the best position for spinal alignment." },
    { id: 25, icon: "🍇", category: "Antioxidants", text: "Blueberries contain the highest antioxidant capacity of all commonly consumed fruits and vegetables." },
    { id: 26, icon: "🚬", category: "Lungs", text: "Within 20 minutes of quitting smoking, your heart rate and blood pressure drop to normal levels." },
    { id: 27, icon: "🌡️", category: "Recovery", text: "Taking a cold shower can reduce muscle inflammation and improve circulation after exercise." },
    { id: 28, icon: "🍞", category: "Fiber", text: "Switching from white bread to whole grain can reduce the risk of heart disease by 20%." },
    { id: 29, icon: "🫀", category: "Circulation", text: "Elevating your legs for 15 minutes a day improves blood flow and reduces swelling." },
    { id: 30, icon: "🥛", category: "Bones", text: "Calcium absorption is highest when taken in smaller doses (500mg) throughout the day." },
    { id: 31, icon: "🤧", category: "Allergies", text: "Showering before bed washes away pollen and allergens, preventing night-time congestion." },
    { id: 32, icon: "👣", category: "Feet", text: "Walking barefoot on grass (earthing) can help reduce inflammation and improve sleep." },
    { id: 33, icon: "🧂", category: "Diet", text: "Reducing salt intake by 1 tsp per day can lower stroke risk by 23%." },
    { id: 34, icon: "🌶️", category: "Metabolism", text: "Spicy foods containing capsaicin can temporarily boost your metabolism by up to 8%." },
    { id: 35, icon: "👂", category: "Hearing", text: "Using earbuds at 60% volume for no more than 60 minutes a day protects against hearing loss." },
    { id: 36, icon: "🍵", category: "Detox", text: "Green tea contains catechins which help protect the liver from toxic substances." },
    { id: 37, icon: "🧘‍♀️", category: "Flexibility", text: "Stretching for 10 minutes daily improves blood flow to muscles and prevents injury." },
    { id: 38, icon: "🍳", category: "Protein", text: "Eating 30g of protein at breakfast helps control appetite and cravings throughout the day." },
    { id: 39, icon: "🫂", category: "Social", text: "Strong social connections can boost your immune system and increase longevity by 50%." },
    { id: 40, icon: "🍋", category: "Digestion", text: "Warm lemon water in the morning aids digestion and helps flush out toxins." },
    { id: 41, icon: "📖", category: "Brain", text: "Reading for 6 minutes can reduce stress levels by 68%, more than listening to music." },
    { id: 42, icon: "🍬", category: "Sugar", text: "Reducing sugar intake can improve skin clarity and reduce aging signs within a week." },
    { id: 43, icon: "🧊", category: "First Aid", text: "Apply ice to a new injury for 20 mins every hour to reduce swelling; heat makes it worse." },
    { id: 44, icon: "🩺", category: "Checkups", text: "Regular blood pressure checks can catch hypertension early, which often has no symptoms." },
    { id: 45, icon: "🍅", category: "Cancer Prevention", text: "Cooked tomatoes release lycopene, a powerful antioxidant linked to reduced cancer risk." },
    { id: 46, icon: "🪜", category: "Activity", text: "Taking the stairs instead of the elevator burns 10x more calories per minute." },
    { id: 47, icon: "🌿", category: "Nerves", text: "Scent of lavender has been proven to lower heart rate and blood pressure in stressful situations." },
    { id: 48, icon: "🥝", category: "Immunity", text: "One kiwi fruit contains more than your daily recommended intake of Vitamin C." },
    { id: 49, icon: "🚴", category: "Cardio", text: "Cycling to work is associated with a 45% lower risk of developing cancer and heart disease." },
    { id: 50, icon: "✋", category: "Habits", text: "It takes approximately 66 days to form a new health habit that sticks automatically." },
];

export default function DailyHealthTip() {
    // This ensures the tip stays the same for 24 hours
    const tip = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 shadow-lg text-white">
            {/* Background Pattern (Decoration) */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xl backdrop-blur-sm">
                        {tip.icon}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">
                        Daily Tip: {tip.category}
                    </h3>
                </div>

                <p className="text-lg font-medium leading-relaxed text-white">
                    "{tip.text}"
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-indigo-200">
                        Updated daily
                    </span>

                </div>
            </div>
        </div>
    );
}