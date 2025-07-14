"use client";

import { useEffect, useState } from 'react';
import { ItemsService } from '@/lib/itemsService';
import { OutfitService, Outfit } from '@/lib/outfitService';
import { SavedOutfitService } from '@/lib/savedOutfitService';
import { Item } from '@/lib/types';
import { OCCASIONS, SCORING_CONSTANTS } from '@/lib/constants';
import { Shuffle, Sparkles, Heart, RefreshCw, Palette, Tag, Check, X, Grid, List } from 'lucide-react';
import Image from 'next/image';

const OutfitGeneratorPage = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [outfits, setOutfits] = useState<Outfit[]>([]);
	const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [selectedOccasion, setSelectedOccasion] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [savingOutfit, setSavingOutfit] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [savedOutfitIds, setSavedOutfitIds] = useState<Set<string>>(new Set());
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	const occasions = OCCASIONS;

	// Fetch items and generate initial outfits
	useEffect(() => {
		const fetchData = async () => {
			try {
				setError(null);
				const [{ items: fetchedItems }, savedOutfits] = await Promise.all([
					ItemsService.getItems({}),
					SavedOutfitService.getSavedOutfits()
				]);
				setItems(fetchedItems);

				// Track already saved outfit combinations
				const savedIds = new Set<string>();
				savedOutfits.forEach(outfit => {
					if (outfit.item_ids) {
						const outfitId = outfit.item_ids.sort().join('-');
						savedIds.add(outfitId);
					}
				});
				setSavedOutfitIds(savedIds);

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
		setSaveSuccess(false); // Clear save success banner when generating new outfits

		try {
			// Add a small delay for better UX
			await new Promise(resolve => setTimeout(resolve, 500));

			let generatedOutfits: Outfit[];

			if (selectedOccasion) {
				// Map occasion to mood for the new system
				const moodOutfit = OutfitService.generateMoodBasedOutfit(items, selectedOccasion, []);
				const randomOutfits = OutfitService.generateOutfits(items, 4, selectedOccasion);
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
			setSaveSuccess(false); // Clear save success banner when changing outfits
			setCurrentOutfitIndex((prev) => (prev + 1) % outfits.length);
		}
	};

	const prevOutfit = () => {
		if (outfits.length > 0) {
			setSaveSuccess(false); // Clear save success banner when changing outfits
			setCurrentOutfitIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
		}
	};

	const saveCurrentOutfit = async () => {
		const currentOutfit = getCurrentOutfit();
		if (!currentOutfit) return;

		setSavingOutfit(true);
		try {
			const savedOutfit = await SavedOutfitService.saveOutfit(currentOutfit);
			if (savedOutfit) {
				setSaveSuccess(true);
				// Create a unique identifier for this outfit combination
				const outfitId = currentOutfit.items.map(item => item.id).sort().join('-');
				setSavedOutfitIds(prev => new Set(prev).add(outfitId));
				setTimeout(() => setSaveSuccess(false), 3000); // Show success for 3 seconds
			}
		} catch (error) {
			console.error('Error saving outfit:', error);
			setError('Failed to save outfit. Please try again.');
		} finally {
			setSavingOutfit(false);
		}
	};

	// Check if current outfit is already saved
	const isCurrentOutfitSaved = (): boolean => {
		const currentOutfit = getCurrentOutfit();
		if (!currentOutfit) return false;
		const outfitId = currentOutfit.items.map(item => item.id).sort().join('-');
		return savedOutfitIds.has(outfitId);
	};

	const discardCurrentOutfit = () => {
		if (outfits.length <= 1) {
			// If this is the last outfit, generate new ones
			generateNewOutfits();
		} else {
			// Remove current outfit and move to next
			const newOutfits = outfits.filter((_, index) => index !== currentOutfitIndex);
			setOutfits(newOutfits);
			if (currentOutfitIndex >= newOutfits.length) {
				setCurrentOutfitIndex(newOutfits.length - 1);
			}
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
			'jackets': '🧥',
			'underwear': '🩲',
			'activewear': '🏃‍♀️'
		};
		return emojiMap[category.toLowerCase()] || '👔';
	};

	const getScoreColor = (score: number): string => {
		if (score >= SCORING_CONSTANTS.EXCELLENT_SCORE_THRESHOLD) return 'text-foreground bg-highlight/30';
		if (score >= SCORING_CONSTANTS.GOOD_SCORE_THRESHOLD) return 'text-foreground bg-accent/30';
		return 'text-foreground bg-secondary/50';
	};

	const getScoreLabel = (score: number): string => {
		if (score >= SCORING_CONSTANTS.EXCELLENT_SCORE_THRESHOLD) return 'Excellent Match';
		if (score >= SCORING_CONSTANTS.GOOD_SCORE_THRESHOLD) return 'Good Match';
		if (score >= SCORING_CONSTANTS.OKAY_SCORE_THRESHOLD) return 'Okay Match';
		return 'Experimental';
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-foreground opacity-70">Loading your wardrobe...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="text-6xl mb-6">⚠️</div>
					<h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
					<p className="text-foreground opacity-70 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (items.length < 3) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="text-6xl mb-6">👗</div>
					<h1 className="text-2xl font-bold text-foreground mb-4">Not Enough Items</h1>
					<p className="text-foreground opacity-70 mb-6">
						You need at least 3 items in your closet to generate outfits.
						Add more items to start creating amazing outfit combinations!
					</p>
					<a
						href="/new"
						className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all"
					>
						Add Items to Your Closet
					</a>
				</div>
			</div>
		);
	}

	const currentOutfit = getCurrentOutfit();

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 md:p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-sm font-medium text-foreground mb-4">
						<Sparkles className="h-4 w-4" />
						<span>AI Outfit Generator</span>
					</div>
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						Your Perfect
						<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Outfit Awaits
						</span>
					</h1>
					<p className="text-foreground opacity-70 text-lg max-w-2xl mx-auto">
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
								className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
							>
								{occasions.map((occasion) => (
									<option key={occasion.value} value={occasion.value}>
										{occasion.label}
									</option>
								))}
							</select>
						</div>

						{/* View Mode Toggle */}
						<div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm">
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded transition-all ${viewMode === 'grid'
									? 'bg-gradient-to-r from-primary to-accent text-foreground shadow-lg'
									: 'text-foreground/50 hover:text-foreground'
									}`}
								title="Grid view"
							>
								<Grid className="h-4 w-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded transition-all ${viewMode === 'list'
									? 'bg-gradient-to-r from-primary to-accent text-foreground shadow-lg'
									: 'text-foreground/50 hover:text-foreground'
									}`}
								title="List view"
							>
								<List className="h-4 w-4" />
							</button>
						</div>

						<div className="flex items-end space-x-3">
							<button
								onClick={generateNewOutfits}
								disabled={generating}
								className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-foreground rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
								className="px-4 py-2 text-foreground opacity-70 hover:opacity-100 disabled:opacity-50 transition-opacity"
								disabled={outfits.length <= 1}
							>
								← Previous
							</button>

							<div className="flex items-center space-x-2">
								{outfits.map((_, index) => (
									<button
										key={index}
										onClick={() => {
											setSaveSuccess(false); // Clear save success banner when changing outfits
											setCurrentOutfitIndex(index);
										}}
										className={`w-3 h-3 rounded-full transition-colors ${index === currentOutfitIndex
											? 'bg-primary'
											: 'bg-border hover:bg-secondary'
											}`}
									/>
								))}
							</div>

							<button
								onClick={nextOutfit}
								className="px-4 py-2 text-foreground opacity-70 hover:opacity-100 disabled:opacity-50 transition-opacity"
								disabled={outfits.length <= 1}
							>
								Next →
							</button>
						</div>
					)}
				</div>

				{/* Error display for outfit generation */}
				{error && !loading && (
					<div className="bg-accent/20 border border-accent/50 rounded-lg p-4 mb-6">
						<div className="flex items-center space-x-2">
							<div className="text-foreground text-sm">⚠️</div>
							<p className="text-foreground text-sm">{error}</p>
						</div>
					</div>
				)}

				{/* Current Outfit Display */}
				{currentOutfit ? (
					<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
						{/* Outfit Info */}
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
							<div>
								<h2 className="text-2xl font-bold text-foreground mb-2">{currentOutfit.vibe}</h2>
								<div className="flex items-center space-x-4">
									<span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(currentOutfit.score)}`}>
										{Math.round(currentOutfit.score)}% {getScoreLabel(currentOutfit.score)}
									</span>
									<div className="flex items-center space-x-1 text-foreground opacity-60">
										<Heart className="h-4 w-4" />
										<span className="text-sm">AI Recommended</span>
									</div>
								</div>
							</div>

							<div className="mt-4 md:mt-0 flex space-x-3">
								{saveSuccess && (
									<div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
										<Check className="h-4 w-4" />
										<span>Saved!</span>
									</div>
								)}

								<button
									onClick={discardCurrentOutfit}
									className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
								>
									<X className="h-4 w-4" />
									<span>Discard</span>
								</button>

								<button
									onClick={saveCurrentOutfit}
									disabled={savingOutfit || isCurrentOutfitSaved()}
									className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${isCurrentOutfitSaved()
											? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed'
											: 'border-border bg-secondary/30 hover:bg-secondary/50'
										}`}
								>
									{savingOutfit ? (
										<RefreshCw className="h-4 w-4 animate-spin" />
									) : isCurrentOutfitSaved() ? (
										<Check className="h-4 w-4" />
									) : (
										<Heart className="h-4 w-4" />
									)}
									<span>
										{savingOutfit ? 'Saving...' : isCurrentOutfitSaved() ? 'Already Saved' : 'Save Outfit'}
									</span>
								</button>
							</div>
						</div>

						{/* Outfit Items */}
						<div className={`mb-8 ${viewMode === 'grid'
								? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
								: 'space-y-4'
							}`}>
							{currentOutfit.items.map((item, index) => (
								<div
									key={`${item.id}-${index}`}
									className={`bg-secondary/20 rounded-lg p-4 ${viewMode === 'list' ? 'flex items-center space-x-4' : ''
										}`}
								>
									<div className={`bg-gradient-to-br from-secondary/30 to-primary/20 rounded-lg flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48 mb-3'
										}`}>
										{item.image_url ? (
											<Image
												src={item.image_url}
												alt={item.name}
												width={viewMode === 'list' ? 96 : 300}
												height={viewMode === 'list' ? 96 : 300}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className={`opacity-60 ${viewMode === 'list' ? 'text-2xl' : 'text-3xl'}`}>
												{getCategoryEmoji(item.category)}
											</span>
										)}
									</div>

									<div className={viewMode === 'list' ? 'flex-1' : ''}>
										<h3 className="font-semibold text-foreground text-sm mb-1">{item.name}</h3>
										<p className="text-xs text-foreground opacity-60 capitalize mb-2">{item.category}</p>

										{/* Colors */}
										{item.colors && item.colors.length > 0 && (
											<div className="flex flex-wrap gap-1 mb-2">
												{item.colors.slice(0, viewMode === 'list' ? 2 : 3).map((color, colorIndex) => (
													<div
														key={colorIndex}
														className="flex items-center space-x-1"
													>
														<div
															className="w-3 h-3 rounded-full border border-border"
															style={{ backgroundColor: color }}
															title={color}
														/>
														{viewMode === 'grid' && (
															<span className="text-xs text-foreground opacity-60">
																{color.length === 7 ? color.toUpperCase() : color}
															</span>
														)}
													</div>
												))}
												{item.colors.length > (viewMode === 'list' ? 2 : 3) && (
													<span className="text-xs text-foreground opacity-60">
														+{item.colors.length - (viewMode === 'list' ? 2 : 3)} more
													</span>
												)}
											</div>
										)}

										{/* Tags - only show in grid view or first 2 in list view */}
										{item.tags && item.tags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{item.tags.slice(0, viewMode === 'list' ? 2 : 3).map((tag, tagIndex) => (
													<span
														key={tagIndex}
														className="text-xs px-2 py-1 bg-primary/20 text-foreground rounded-full capitalize"
													>
														{tag}
													</span>
												))}
												{item.tags.length > (viewMode === 'list' ? 2 : 3) && (
													<span className="text-xs px-2 py-1 bg-border text-foreground opacity-60 rounded-full">
														+{item.tags.length - (viewMode === 'list' ? 2 : 3)}
													</span>
												)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Outfit Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Dominant Colors */}
							<div className="bg-secondary/20 rounded-lg p-4">
								<div className="flex items-center space-x-2 mb-3">
									<Palette className="h-5 w-5 text-foreground opacity-70" />
									<h3 className="font-semibold text-foreground">Color Palette</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{currentOutfit.dominantColors.map((color, index) => (
										<div
											key={index}
											className="flex items-center space-x-2 px-3 py-2 bg-background rounded-full"
										>
											<div
												className="w-4 h-4 rounded-full border border-border"
												style={{ backgroundColor: color }}
												title={color}
											/>
											<span className="text-sm text-foreground">
												{color.length === 7 ? color.toUpperCase() : color}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Style Tags */}
							<div className="bg-secondary/20 rounded-lg p-4">
								<div className="flex items-center space-x-2 mb-3">
									<Tag className="h-5 w-5 text-foreground opacity-70" />
									<h3 className="font-semibold text-foreground">Style Tags</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{currentOutfit.tags.slice(0, 6).map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-primary/20 text-foreground rounded-full text-sm capitalize"
										>
											{tag}
										</span>
									))}
									{currentOutfit.tags.length > 6 && (
										<span className="px-3 py-1 bg-border text-foreground opacity-60 rounded-full text-sm">
											+{currentOutfit.tags.length - 6} more
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-background rounded-2xl shadow-lg p-8 text-center">
						<div className="text-4xl mb-4">🎯</div>
						<h2 className="text-xl font-semibold text-foreground mb-2">No Outfits Generated</h2>
						<p className="text-foreground opacity-70 mb-4">
							Click &quot;Generate Outfits&quot; to create amazing combinations from your closet
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default OutfitGeneratorPage;
