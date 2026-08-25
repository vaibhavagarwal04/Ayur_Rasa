export type Dosha = "Vata" | "Pitta" | "Kapha";

export interface Question {
  id: string;
  text: string;
  options: {
    label: string;
    dosha: Dosha;
  }[];
}

export const questions: Question[] = [
  {
    id: "body_frame",
    text: "What is your body frame?",
    options: [
      { label: "Well Built", dosha: "Kapha" },
      { label: "Thin and Lean", dosha: "Vata" },
      { label: "Medium", dosha: "Pitta" },
    ],
  },
  {
    id: "type_of_hair",
    text: "What is your hair type?",
    options: [
      { label: "Dry", dosha: "Vata" },
      { label: "Normal", dosha: "Pitta" },
      { label: "Greasy", dosha: "Kapha" },
    ],
  },
  {
    id: "color_of_hair",
    text: "What is your hair color?",
    options: [
      { label: "Grey", dosha: "Vata" },
      { label: "Brown", dosha: "Pitta" },
      { label: "Black", dosha: "Kapha" },
    ],
  },
  {
    id: "skin",
    text: "How would you describe your skin?",
    options: [
      { label: "Dry, Rough", dosha: "Vata" },
      { label: "Soft, Sweating", dosha: "Pitta" },
      { label: "Moist, Greasy", dosha: "Kapha" },
    ],
  },
  {
    id: "complexion",
    text: "What is your complexion?",
    options: [
      { label: "Dark", dosha: "Vata" },
      { label: "Pinkish", dosha: "Pitta" },
      { label: "Glowing", dosha: "Kapha" },
    ],
  },
  {
    id: "body_weight",
    text: "How would you describe your body weight?",
    options: [
      { label: "Underweight", dosha: "Vata" },
      { label: "Normal", dosha: "Pitta" },
      { label: "Overweight", dosha: "Kapha" },
    ],
  },
  {
    id: "nails",
    text: "What is the usual appearance of your nails?",
    options: [
      { label: "Blackish", dosha: "Vata" },
      { label: "Redish", dosha: "Pitta" },
      { label: "Pinkish", dosha: "Kapha" },
    ],
  },
  {
    id: "teeth",
    text: "What best describes your teeth?",
    options: [
      { label: "Irregular, Blackish", dosha: "Vata" },
      { label: "Medium, Yellowish", dosha: "Pitta" },
      { label: "Large, White", dosha: "Kapha" },
    ],
  },
  {
    id: "pace_of_work",
    text: "What is your usual pace of performing work?",
    options: [
      { label: "Fast", dosha: "Vata" },
      { label: "Medium", dosha: "Pitta" },
      { label: "Slow", dosha: "Kapha" },
    ],
  },
  {
    id: "mental_activity",
    text: "How would you describe your mental activity?",
    options: [
      { label: "Restless", dosha: "Vata" },
      { label: "Aggressive", dosha: "Pitta" },
      { label: "Stable", dosha: "Kapha" },
    ],
  },
  {
    id: "memory",
    text: "How would you describe your memory?",
    options: [
      { label: "Short term", dosha: "Vata" },
      { label: "Good Memory", dosha: "Pitta" },
      { label: "Long Term", dosha: "Kapha" },
    ],
  },
  {
    id: "sleep_pattern",
    text: "What is your usual sleep pattern?",
    options: [
      { label: "Less", dosha: "Vata" },
      { label: "Moderate", dosha: "Pitta" },
      { label: "Sleepy", dosha: "Kapha" },
    ],
  },
  {
    id: "weather_conditions",
    text: "Which weather condition do you dislike most?",
    options: [
      { label: "Dislike Cold", dosha: "Vata" },
      { label: "Dislike Heat", dosha: "Pitta" },
      { label: "Dislike Moist", dosha: "Kapha" },
    ],
  },
  {
    id: "reaction_adverse",
    text: "How do you usually react under adverse situations?",
    options: [
      { label: "Anxiety", dosha: "Vata" },
      { label: "Anger", dosha: "Pitta" },
      { label: "Calm", dosha: "Kapha" },
    ],
  },
  {
    id: "mood",
    text: "How would you describe your mood?",
    options: [
      { label: "Changes Quickly", dosha: "Vata" },
      { label: "Constant", dosha: "Pitta" },
      { label: "Changes Slowly", dosha: "Kapha" },
    ],
  },
  {
    id: "eating_habit",
    text: "How would you describe your eating habit?",
    options: [
      { label: "Irregular Chewing", dosha: "Vata" },
      { label: "Improper Chewing", dosha: "Pitta" },
      { label: "Proper Chewing", dosha: "Kapha" },
    ],
  },
  {
    id: "hunger",
    text: "How would you describe your hunger pattern?",
    options: [
      { label: "Irregular", dosha: "Vata" },
      { label: "Sudden and Sharp", dosha: "Pitta" },
      { label: "Skips Meal", dosha: "Kapha" },
    ],
  },
  {
    id: "body_temperature",
    text: "How is your usual body temperature?",
    options: [
      { label: "Less than Normal", dosha: "Vata" },
      { label: "More than Normal", dosha: "Pitta" },
      { label: "Normal", dosha: "Kapha" },
    ],
  },
  {
    id: "joints",
    text: "How would you describe your joints?",
    options: [
      { label: "Weak", dosha: "Vata" },
      { label: "Healthy", dosha: "Pitta" },
      { label: "Heavy", dosha: "Kapha" },
    ],
  },
  {
    id: "nature",
    text: "Which best describes your nature?",
    options: [
      { label: "Jealous, Fearful", dosha: "Vata" },
      { label: "Egoistic, Fearless", dosha: "Pitta" },
      { label: "Forgiving, Grateful", dosha: "Kapha" },
    ],
  },
  {
    id: "body_energy",
    text: "How would you describe your body energy?",
    options: [
      { label: "Low", dosha: "Vata" },
      { label: "High", dosha: "Pitta" },
      { label: "Medium", dosha: "Kapha" },
    ],
  },
  {
    id: "quality_of_voice",
    text: "How would you describe your voice?",
    options: [
      { label: "Rough", dosha: "Vata" },
      { label: "Fast", dosha: "Pitta" },
      { label: "Deep", dosha: "Kapha" },
    ],
  },
  {
    id: "dreams",
    text: "What type of dreams do you commonly experience?",
    options: [
      { label: "Sky", dosha: "Vata" },
      { label: "Fire", dosha: "Pitta" },
      { label: "Water", dosha: "Kapha" },
    ],
  },
  {
    id: "social_relations",
    text: "How would you describe your social nature?",
    options: [
      { label: "Ambivert", dosha: "Vata" },
      { label: "Extrovert", dosha: "Pitta" },
      { label: "Introvert", dosha: "Kapha" },
    ],
  },
  {
    id: "body_odor",
    text: "How would you describe your body odor?",
    options: [
      { label: "Negligible", dosha: "Vata" },
      { label: "Strong", dosha: "Pitta" },
      { label: "Mild", dosha: "Kapha" },
    ],
  },
];