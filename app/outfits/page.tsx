"use client";

import { useEffect, useState } from 'react';
import { ItemsService } from '@/lib/itemsService';
import { OutfitService, Outfit } from '@/lib/outfitService';
import { Item } from '@/lib/types';
import { OCCASIONS, SCORING_CONSTANTS } from '@/lib/constants';
import { Shuffle, Sparkles, Heart, RefreshCw, Palette, Tag } from 'lucide-react';
import Image from 'next/image';

const OutfitGeneratorPage = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [outfits, setOutfits] = useState<Outfit[]>([]);
	const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [selectedOccasion, setSelectedOccasion] = useState('');
	const [error, setError] = useState<string | null>(null);

	const occasions = OCCASIONS;

	// Fetch items and generate initial outfits
	useEffect(() => {
		const fetchData = async () => {
			try {
				setError(null);
				const { items: fetchedItems } = await ItemsService.getItems({});
				setItems(fetchedItems);

				if (fetchedItems.length >= 3) {
					const generatedOutfits = OutfitService.generateOutfits(fetchedItems, 5);
					setOutfits(generatedOutfits);
				}
			} catch (error) {
				console.error('Error fetching items:', error);
				setError('Failed to load your wardrobe. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const generateNewOutfits = async () => {
		if (items.length < 3) return;

		setGenerating(true);
		setError(null);

		try {
			// Add a small delay for better UX
			await new Promise(resolve => setTimeout(resolve, 500));

			let generatedOutfits: Outfit[];

			if (selectedOccasion) {
				// Map occasion to mood for the new system
				const moodOutfit = OutfitService.generateMoodBasedOutfit(items, selectedOccasion, []);
				const randomOutfits = OutfitService.generateOutfits(items, 4);
				generatedOutfits = moodOutfit ? [moodOutfit, ...randomOutfits] : randomOutfits;
			} else {
				generatedOutfits = OutfitService.generateOutfits(items, 5);
			}

			if (generatedOutfits.length === 0) {
				setError('Could not generate any suitable outfits. Try adding more items or different combinations to your wardrobe.');
			} else {
				setOutfits(generatedOutfits);
				setCurrentOutfitIndex(0);
			}
		} catch (error) {
			console.error('Error generating outfits:', error);
			setError('Failed to generate outfits. Please try again.');
		} finally {
			setGenerating(false);
		}
	};

	const getCurrentOutfit = (): Outfit | null => {
		return outfits[currentOutfitIndex] || null;
	};

	const nextOutfit = () => {
		if (outfits.length > 0) {
			setCurrentOutfitIndex((prev) => (prev + 1) % outfits.length);
		}
	};

	const prevOutfit = () => {
		if (outfits.length > 0) {
			setCurrentOutfitIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
		}
	};

	const getCategoryEmoji = (category: string): string => {
		const emojiMap: { [key: string]: string } = {
			'clothing': '👔',
			'accessories': '👜',
			'footwear': '👟',
			'bags': '🎒',
			'jewelry': '💍',
			'outerwear': '🧥',
			'underwear': '🩲',
			'activewear': '🏃‍♀️'
		};
		return emojiMap[category.toLowerCase()] || '👔';
	};

	const getScoreColor = (score: number): string => {
		if (score >= SCORING_CONSTANTS.EXCELLENT_SCORE_THRESHOLD) return 'text-green-600 bg-green-100';
		if (score >= SCORING_CONSTANTS.GOOD_SCORE_THRESHOLD) return 'text-yellow-600 bg-yellow-100';
		return 'text-red-600 bg-red-100';
	};

	const getScoreLabel = (score: number): string => {
		if (score >= SCORING_CONSTANTS.EXCELLENT_SCORE_THRESHOLD) return 'Excellent Match';
		if (score >= SCORING_CONSTANTS.GOOD_SCORE_THRESHOLD) return 'Good Match';
		if (score >= SCORING_CONSTANTS.OKAY_SCORE_THRESHOLD) return 'Okay Match';
		return 'Experimental';
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your wardrobe...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="text-6xl mb-6">⚠️</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (items.length < 3) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="text-6xl mb-6">👗</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Not Enough Items</h1>
					<p className="text-gray-600 mb-6">
						You need at least 3 items in your closet to generate outfits.
						Add more items to start creating amazing outfit combinations!
					</p>
					<a
						href="/new"
						className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
					>
						Add Items to Your Closet
					</a>
				</div>
			</div>
		);
	}

	const currentOutfit = getCurrentOutfit();

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
						<Sparkles className="h-4 w-4" />
						<span>AI Outfit Generator</span>
					</div>
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Your Perfect
						<span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Outfit Awaits
						</span>
					</h1>
					<p className="text-gray-600 text-lg max-w-2xl mx-auto">
						Let our AI stylist create amazing outfit combinations from your closet using color theory and style matching
					</p>
				</div>

				{/* Controls */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
					<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Occasion
							</label>
							<select
								value={selectedOccasion}
								onChange={(e) => setSelectedOccasion(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
							>
								{occasions.map((occasion) => (
									<option key={occasion.value} value={occasion.value}>
										{occasion.label}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-end space-x-3">
							<button
								onClick={generateNewOutfits}
								disabled={generating}
								className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{generating ? (
									<RefreshCw className="h-5 w-5 animate-spin" />
								) : (
									<Shuffle className="h-5 w-5" />
								)}
								<span>{generating ? 'Generating...' : 'Generate Outfits'}</span>
							</button>
						</div>
					</div>

					{/* Outfit Navigation */}
					{outfits.length > 0 && (
						<div className="flex items-center justify-between">
							<button
								onClick={prevOutfit}
								className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
								disabled={outfits.length <= 1}
							>
								← Previous
							</button>

							<div className="flex items-center space-x-2">
								{outfits.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentOutfitIndex(index)}
										className={`w-3 h-3 rounded-full transition-colors ${index === currentOutfitIndex
											? 'bg-purple-600'
											: 'bg-gray-300 hover:bg-gray-400'
											}`}
									/>
								))}
							</div>

							<button
								onClick={nextOutfit}
								className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
								disabled={outfits.length <= 1}
							>
								Next →
							</button>
						</div>
					)}
				</div>

				{/* Error display for outfit generation */}
				{error && !loading && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center space-x-2">
							<div className="text-red-500 text-sm">⚠️</div>
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					</div>
				)}

				{/* Current Outfit Display */}
				{currentOutfit ? (
					<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
						{/* Outfit Info */}
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">{currentOutfit.vibe}</h2>
								<div className="flex items-center space-x-4">
									<span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(currentOutfit.score)}`}>
										{Math.round(currentOutfit.score)}% {getScoreLabel(currentOutfit.score)}
									</span>
									<div className="flex items-center space-x-1 text-gray-500">
										<Heart className="h-4 w-4" />
										<span className="text-sm">AI Recommended</span>
									</div>
								</div>
							</div>

							<div className="mt-4 md:mt-0">
								<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
									<Heart className="h-4 w-4" />
									<span>Save Outfit</span>
								</button>
							</div>
						</div>

						{/* Outfit Items */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
							{currentOutfit.items.map((item, index) => (
								<div key={`${item.id}-${index}`} className="bg-gray-50 rounded-lg p-4">
									<div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-3">
										{item.image_url ? (
											<Image
												src={item.image_url}
												alt={item.name}
												width={128}
												height={128}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-2xl opacity-60">
												{getCategoryEmoji(item.category)}
											</span>
										)}
									</div>

									<h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
									<p className="text-xs text-gray-600 capitalize mb-2">{item.category}</p>

									{/* Colors */}
									{item.colors && item.colors.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-2">
											{item.colors.slice(0, 3).map((color, colorIndex) => (
												<div
													key={colorIndex}
													className="flex items-center space-x-1"
												>
													<div
														className="w-3 h-3 rounded-full border border-gray-300"
														style={{ backgroundColor: color }}
														title={color}
													/>
													<span className="text-xs text-gray-600">
														{color.length === 7 ? color.toUpperCase() : color}
													</span>
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>

						{/* Outfit Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Dominant Colors */}
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="flex items-center space-x-2 mb-3">
									<Palette className="h-5 w-5 text-gray-600" />
									<h3 className="font-semibold text-gray-900">Color Palette</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{currentOutfit.dominantColors.map((color, index) => (
										<div
											key={index}
											className="flex items-center space-x-2 px-3 py-2 bg-white rounded-full"
										>
											<div
												className="w-4 h-4 rounded-full border border-gray-300"
												style={{ backgroundColor: color }}
												title={color}
											/>
											<span className="text-sm text-gray-700">
												{color.length === 7 ? color.toUpperCase() : color}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Style Tags */}
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="flex items-center space-x-2 mb-3">
									<Tag className="h-5 w-5 text-gray-600" />
									<h3 className="font-semibold text-gray-900">Style Tags</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{currentOutfit.tags.slice(0, 6).map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize"
										>
											{tag}
										</span>
									))}
									{currentOutfit.tags.length > 6 && (
										<span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
											+{currentOutfit.tags.length - 6} more
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<div className="text-4xl mb-4">🎯</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">No Outfits Generated</h2>
						<p className="text-gray-600 mb-4">
							Click &quot;Generate Outfits&quot; to create amazing combinations from your closet
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default OutfitGeneratorPage;
