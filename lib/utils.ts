import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const predefinedCategories = {
  'Food & Dining': [
    '🍽️ Restaurants', '🛒 Groceries', '☕ Coffee Shops',
    '🍕 Fast Food', '🍻 Bars & Pubs', '🍱 Takeout', '🍲 Meal Kits',
    '🥡 Food Delivery (UberEats, DoorDash)', '🍦 Snacks & Treats', '🥤 Bubble Tea', '🍰 Desserts'
  ],
  'Transportation': [
    '🚗 Gas', '🚇 Public Transit', '🚕 Taxi/Uber',
    '🚲 Bike Rentals', '🛴 E-Scooters', '🅿️ Parking Fees', '🚗 Car Rentals',
    '🚘 Car Payments', '🔧 Vehicle Maintenance', '🛣️ Toll Fees', '🏎️ Ride Shares (Lyft)'
  ],
  'Housing': [
    '🏠 Rent/Mortgage', '🔧 Utilities', '🛠️ Maintenance',
    '🔌 Internet', '📺 Streaming Services', '🛏️ Home Furnishings', '🧹 Cleaning Services',
    '🔑 Renters Insurance', '🚪 Home Security', '💡 Smart Home Devices', '🛍️ Home Decor'
  ],
  'Entertainment': [
    '🎬 Movies', '🎵 Music', '🎮 Games',
    '🎧 Subscriptions (Netflix, Spotify)', '🎢 Events & Concerts', '📚 Books & eBooks', '🏞️ Outdoor Activities',
    '🃏 Board Games & Puzzles', '🎤 Karaoke', '🎯 Social Clubs & Memberships', '📽️ Digital Media (YouTube, Twitch)'
  ],
  'Shopping': [
    '👚 Clothing', '🛍️ General', '📚 Books',
    '💻 Electronics', '📱 Smartphones & Accessories', '🐾 Pets', '🖥️ Amazon', '💄 Beauty & Grooming', '📦 Online Subscriptions',
    '👠 Footwear', '🎒 Bags & Accessories', '⌚ Watches & Jewelry', '💡 Tech Gadgets', '🔌 Home Appliances'
  ],
  'Health & Fitness': [
    '💊 Healthcare', '🏋️ Gym', '🧘 Wellness',
    '🥗 Nutrition & Supplements', '🧴 Skincare', '🦷 Dental Care', '🏃‍♂️ Sports & Fitness Gear',
    '👓 Vision Care (Glasses/Contacts)', '🧪 Lab Tests & Screenings', '💉 Vaccinations', '🩺 Doctor Visits'
  ],
  'Travel': [
    '✈️ Flights', '🏨 Accommodation', '🍴 Dining Out',
    '🚌 Transportation (Local)', '🚗 Car Rentals', '🏝️ Activities & Tours', '💼 Business Travel',
    '🛏️ Airbnb', '🚤 Cruises', '🏞️ Adventure Trips', '🎒 Backpacking'
  ],
  'Education': [
    '📚 Tuition', '📖 Books', '💻 Online Courses',
    '✍️ Workshops & Bootcamps', '📝 Study Materials', '📜 Certifications', '🎓 Student Loans',
    '🔬 Lab Fees', '📅 Tutoring', '🎥 Educational Subscriptions (Coursera, MasterClass)', '🖥️ Tech for School'
  ],
  'Income': [
    '💼 Salary', '💰 Freelance', '📈 Investments',
    '💸 Side Hustles', '🛒 eCommerce Earnings', '🏦 Dividends & Interest', '🎯 Gig Economy',
    '📝 Content Creation (YouTube, TikTok)', '📦 Reselling (eBay, Poshmark)', '🚗 Ride-Share Driving (Uber, Lyft)', '🎮 Streaming Income (Twitch)'
  ],
  'Self-Care & Personal Development': [
    '🧘 Therapy & Counseling', '📚 Self-Help Books', '🌱 Hobbies & Crafts',
    '💆 Spa & Relaxation', '📖 Journaling & Mindfulness', '🎨 Art Supplies',
    '🎧 Meditation Apps', '🧑‍🏫 Coaching & Mentorship', '✍️ Writing & Blogging', '📸 Photography & Videography Gear'
  ],
  'Subscriptions & Memberships': [
    '📺 Streaming (Netflix, Disney+)', '🎵 Music Subscriptions (Spotify, Apple Music)', '🎮 Gaming (Xbox Live, PS Plus)',
    '🎧 Audiobooks (Audible)', '📰 News & Magazines', '💌 Online Tools (Adobe, Canva)', '📅 Premium App Subscriptions',
    '🏋️ Gym Memberships', '🎓 Educational Platforms (Coursera, Udemy)', '📦 Product Subscriptions (FabFitFun, HelloFresh)'
  ]
};