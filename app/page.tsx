import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import QuickActionsSection from '../components/sections/QuickActionsSection';
import RecentItemsSection from '../components/sections/RecentItemsSection';
import MoodBoardSection from '../components/sections/MoodBoardSection';
import Footer from '../components/sections/Footer';

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<HeroSection />
				<StatsSection />
				<QuickActionsSection />
				<RecentItemsSection />
				<MoodBoardSection />
			</div>
			<Footer />
		</main>
	);
}
