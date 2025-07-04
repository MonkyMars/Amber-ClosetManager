'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoodService } from '@/lib/moodService';
import { Mood } from '@/lib/types';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

const MoodBoardSection = () => {
	const [moods, setMoods] = useState<Mood[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadMoods();
	}, []);

	const loadMoods = async () => {
		const moodsData = await MoodService.getMoods();
		setMoods(moodsData.slice(0, 3)); // Show only first 3 moods
		setLoading(false);
	};

	const getVibeEmoji = (vibe: string) => {
		const vibeEmojis: Record<string, string> = {
			casual: '😌',
			formal: '👔',
			cozy: '🧸',
			edgy: '🖤',
			romantic: '💖',
			professional: '💼',
			sporty: '🏃‍♀️',
			bohemian: '🌻'
		};
		return vibeEmojis[vibe] || '✨';
	};

	if (loading) {
		return (
			<section className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-6">
					Style Moods
				</h2>
				<div className="flex justify-center py-8">
					<LoadingSpinner />
				</div>
			</section>
		);
	}

	return (
		<section className="mb-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-foreground">
					Style Moods
				</h2>
				<Link
					href="/moods"
					className="text-highlight hover:underline text-sm font-medium"
				>
					View All
				</Link>
			</div>

			{moods.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-foreground opacity-60 mb-4">
						No style moods created yet
					</p>
					<Link
						href="/moods"
						className="inline-block bg-highlight text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
					>
						Create Your First Mood
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{moods.map((mood) => (
						<Card key={mood.id} hover className="group overflow-hidden">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-2xl group-hover:scale-110 transition-transform duration-200">
										{mood.emoji}
									</span>
									<div className="flex items-center gap-1">
										{getVibeEmoji(mood.vibe)}
										<span className="text-xs text-gray-500 capitalize">
											{mood.vibe}
										</span>
									</div>
								</div>

								<div className="flex space-x-1">
									{mood.colors.slice(0, 5).map((color: string, index: number) => (
										<div
											key={index}
											className="w-4 h-4 rounded-full border border-border"
											style={{ backgroundColor: color }}
											title={color}
										/>
									))}
									{mood.colors.length > 5 && (
										<div className="w-4 h-4 rounded-full bg-gray-100 border border-border flex items-center justify-center">
											<span className="text-xs text-gray-600">+{mood.colors.length - 5}</span>
										</div>
									)}
								</div>

								<div>
									<h3 className="font-semibold text-foreground mb-1">
										{mood.title}
									</h3>
									<p className="text-sm text-foreground opacity-70 line-clamp-2">
										{mood.description}
									</p>
								</div>

								<div className="pt-2">
									<Link
										href={`/moods?mood=${mood.id}`}
										className="text-xs text-highlight hover:underline font-medium"
									>
										Generate Outfit →
									</Link>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</section>
	);
};

export default MoodBoardSection;
