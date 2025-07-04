'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MoodService } from '@/lib/moodService';
import { Mood, Item } from '@/lib/types';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CreateMoodModal from '@/components/CreateMoodModal';
import { Plus, Palette, Sparkles, Eye } from 'lucide-react';

export default function MoodsPage() {
	const [moods, setMoods] = useState<Mood[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
	const [outfitItems, setOutfitItems] = useState<Item[]>([]);
	const [generatingOutfit, setGeneratingOutfit] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);

	useEffect(() => {
		loadMoods();
	}, []);

	const loadMoods = async () => {
		setLoading(true);
		const moodsData = await MoodService.getMoods();
		setMoods(moodsData);
		setLoading(false);
	};

	const handleMoodCreated = (newMood: Mood) => {
		setMoods(prev => [newMood, ...prev]);
	};

	const generateOutfitForMood = async (mood: Mood) => {
		if (!mood.id) return;

		setSelectedMood(mood);
		setGeneratingOutfit(true);

		try {
			const outfit = await MoodService.generateMoodOutfit(mood.id);
			setOutfitItems(outfit);
		} catch (error) {
			console.error('Error generating outfit:', error);
		} finally {
			setGeneratingOutfit(false);
		}
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
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Style Moods
						</h1>
						<p className="text-foreground opacity-70">
							Create and explore different style vibes for your wardrobe
						</p>
					</div>
					<button
						onClick={() => setShowCreateForm(true)}
						className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-foreground px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
					>
						<Plus className="w-5 h-5" />
						Create Mood
					</button>
				</div>

				{/* Moods Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{moods.map((mood) => (
						<Card key={mood.id} hover className="group">
							<div className="space-y-4">
								{/* Header */}
								<div className="flex items-center justify-between">
									<span className="text-2xl group-hover:scale-110 transition-transform duration-200">
										{mood.emoji}
									</span>
									<div className="flex items-center gap-1">
										{getVibeEmoji(mood.vibe)}
										<span className="text-xs text-foreground opacity-60 capitalize">
											{mood.vibe}
										</span>
									</div>
								</div>

								{/* Colors */}
								<div className="flex flex-wrap gap-2">
									{mood.colors.slice(0, 5).map((color, index) => (
										<div
											key={index}
											className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
											style={{ backgroundColor: color }}
											title={color}
										/>
									))}
									{mood.colors.length > 5 && (
										<div className="w-6 h-6 rounded-full bg-secondary border-2 border-background shadow-sm flex items-center justify-center">
											<span className="text-xs text-foreground opacity-60">+{mood.colors.length - 5}</span>
										</div>
									)}
								</div>

								{/* Content */}
								<div>
									<h3 className="font-semibold text-foreground mb-1">
										{mood.title}
									</h3>
									<p className="text-sm text-foreground opacity-70 line-clamp-2">
										{mood.description}
									</p>
								</div>

								{/* Tags */}
								{mood.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{mood.tags.slice(0, 3).map((tag, index) => (
											<span
												key={index}
												className="text-xs bg-secondary text-foreground opacity-80 px-2 py-1 rounded-full"
											>
												{tag}
											</span>
										))}
										{mood.tags.length > 3 && (
											<span className="text-xs text-gray-400">
												+{mood.tags.length - 3} more
											</span>
										)}
									</div>
								)}

								{/* Actions */}
								<div className="flex gap-2 pt-2">
									<button
										onClick={() => generateOutfitForMood(mood)}
										className="flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-primary/20 to-accent/20 text-foreground px-4 py-2 rounded-lg hover:from-primary/30 hover:to-accent/30 transition-all"
									>
										<Sparkles className="w-4 h-4" />
										Generate Outfit
									</button>
									<button className="flex items-center justify-center gap-2 text-sm bg-secondary/50 text-foreground px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors">
										<Eye className="w-4 h-4" />
										View
									</button>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Generated Outfit Display */}
				{selectedMood && (
					<div className="mt-8">
						<Card>
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xl font-semibold text-foreground">
											{selectedMood.emoji} {selectedMood.title} Outfit
										</h3>
										<p className="text-foreground opacity-70">Generated outfit suggestions</p>
									</div>
									<button
										onClick={() => setSelectedMood(null)}
										className="text-foreground opacity-50 hover:opacity-80 transition-opacity"
									>
										✕
									</button>
								</div>

								{generatingOutfit ? (
									<div className="flex items-center justify-center py-12">
										<LoadingSpinner />
										<span className="ml-3 text-foreground opacity-70">Generating perfect outfit...</span>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
										{outfitItems.map((item) => (
											<Card key={item.id} hover className="group">
												<div className="space-y-3">
													{item.image_url ? (
														<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
															<Image
																src={item.image_url}
																alt={item.name}
																width={200}
																height={200}
																className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
															/>
														</div>
													) : (
														<div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/20 rounded-lg flex items-center justify-center">
															<Palette className="w-8 h-8 text-foreground opacity-50" />
														</div>
													)}

													<div>
														<h4 className="font-medium text-foreground text-sm line-clamp-1">
															{item.name}
														</h4>
														<p className="text-xs text-foreground opacity-60 capitalize">
															{item.category}
														</p>
													</div>

													<div className="flex flex-wrap gap-1">
														{item.colors.slice(0, 3).map((color, index) => (
															<div
																key={index}
																className="w-3 h-3 rounded-full border border-border"
																style={{ backgroundColor: color }}
																title={color}
															/>
														))}
													</div>
												</div>
											</Card>
										))}
									</div>
								)}

								{!generatingOutfit && outfitItems.length === 0 && (
									<div className="text-center py-12">
										<p className="text-foreground opacity-60">
											No items found for this mood. Try adding more items to your wardrobe!
										</p>
									</div>
								)}
							</div>
						</Card>
					</div>
				)}

				{/* Empty State */}
				{moods.length === 0 && (
					<div className="text-center py-12">
						<div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
							<Palette className="w-12 h-12 text-foreground opacity-70" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No moods created yet
						</h3>
						<p className="text-foreground opacity-70 mb-6">
							Create your first style mood to get outfit suggestions
						</p>
						<button
							onClick={() => setShowCreateForm(true)}
							className="bg-gradient-to-r from-primary to-accent text-foreground px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
						>
							Create Your First Mood
						</button>
					</div>
				)}

				{/* Create Mood Modal */}
				<CreateMoodModal
					isOpen={showCreateForm}
					onClose={() => setShowCreateForm(false)}
					onMoodCreated={handleMoodCreated}
				/>
			</div>
		</div>
	);
}
