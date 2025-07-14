'use client';

import { useState, useEffect } from 'react';
import { SavedOutfitService, SavedOutfit } from '../../lib/savedOutfitService';
import { ItemsService } from '../../lib/itemsService';
import { Item } from '../../lib/types';
import { Heart, Star, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function ClosetPage() {
	const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
	const [outfitItems, setOutfitItems] = useState<{ [outfitId: string]: Item[] }>({});
	const [coverImages, setCoverImages] = useState<{ [outfitId: string]: number }>({});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'high-rated'>('all');
	const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit | null>(null);

	useEffect(() => {
		fetchSavedOutfits();
	}, []);

	const fetchSavedOutfits = async () => {
		setLoading(true);
		const outfits = await SavedOutfitService.getSavedOutfits();
		setSavedOutfits(outfits);

		// Fetch item details for each outfit
		const itemsMap: { [outfitId: string]: Item[] } = {};
		for (const outfit of outfits) {
			if (outfit.item_ids && outfit.item_ids.length > 0) {
				try {
					// Get all items for this outfit
					const { items } = await ItemsService.getItems({});
					const outfitItemsData = items.filter(item =>
						item.id && outfit.item_ids?.includes(item.id)
					);
					itemsMap[outfit.id] = outfitItemsData;
				} catch (error) {
					console.error('Error fetching items for outfit:', outfit.id, error);
					itemsMap[outfit.id] = [];
				}
			}
		}
		setOutfitItems(itemsMap);
		setLoading(false);
	};

	const handleUpdateOutfit = async (outfitId: string, updates: { rating?: number; notes?: string }) => {
		await SavedOutfitService.updateSavedOutfit(outfitId, updates);
		fetchSavedOutfits();

		// Update selected outfit if it's the one being updated
		if (selectedOutfit && selectedOutfit.id === outfitId) {
			setSelectedOutfit({ ...selectedOutfit, ...updates });
		}
	};

	const handleDeleteOutfit = async (outfitId: string) => {
		if (confirm('Are you sure you want to delete this outfit?')) {
			await SavedOutfitService.deleteSavedOutfit(outfitId);
			fetchSavedOutfits();
			if (selectedOutfit && selectedOutfit.id === outfitId) {
				setSelectedOutfit(null);
			}
		}
	};

	const filteredOutfits = savedOutfits
		.filter(outfit => {
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				return (
					outfit.name?.toLowerCase().includes(searchLower) ||
					outfit.description?.toLowerCase().includes(searchLower) ||
					outfit.occasion?.toLowerCase().includes(searchLower) ||
					outfit.notes?.toLowerCase().includes(searchLower)
				);
			}
			return true;
		})
		.filter(outfit => {
			switch (filterBy) {
				case 'favorites':
					return outfit.is_favorite;
				case 'high-rated':
					return outfit.rating && outfit.rating >= 4;
				default:
					return true;
			}
		});

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-foreground opacity-70">Loading your closet...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 md:p-8">
			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="mb-6">
						<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-sm font-medium text-foreground mb-4">
							<span>👗</span>
							<span>Your Personal Collection</span>
						</div>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 leading-tight">
						Your
						<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Dream Closet
						</span>
					</h1>
					<p className="text-lg text-foreground opacity-70 leading-relaxed">Manage and explore your saved outfits</p>
				</div>

				{/* Search and Filters */}
				<div className="mb-8 flex flex-col md:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50 h-5 w-5" />
						<input
							type="text"
							placeholder="Search outfits..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
						/>
					</div>

					<div className="flex gap-2">
						<button
							onClick={() => setFilterBy('all')}
							className={`px-4 py-3 rounded-lg transition-all font-medium ${filterBy === 'all'
								? 'bg-gradient-to-r from-primary to-accent text-foreground shadow-lg'
								: 'bg-background text-foreground border border-border hover:bg-secondary/50'
								}`}
						>
							All ({savedOutfits.length})
						</button>
						<button
							onClick={() => setFilterBy('favorites')}
							className={`px-4 py-3 rounded-lg transition-all flex items-center space-x-2 font-medium ${filterBy === 'favorites'
								? 'bg-gradient-to-r from-primary to-accent text-foreground shadow-lg'
								: 'bg-background text-foreground border border-border hover:bg-secondary/50'
								}`}
						>
							<Heart className="h-4 w-4" />
							<span>Favorites</span>
						</button>
						<button
							onClick={() => setFilterBy('high-rated')}
							className={`px-4 py-3 rounded-lg transition-all flex items-center space-x-2 font-medium ${filterBy === 'high-rated'
								? 'bg-gradient-to-r from-primary to-accent text-foreground shadow-lg'
								: 'bg-background text-foreground border border-border hover:bg-secondary/50'
								}`}
						>
							<Star className="h-4 w-4" />
							<span>Top Rated</span>
						</button>
					</div>
				</div>

				{/* Outfits Grid */}
				{filteredOutfits.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-6xl mb-4">👗</div>
						<h3 className="text-xl font-semibold text-foreground mb-2">
							{searchQuery || filterBy !== 'all' ? 'No outfits found' : 'No outfits saved yet'}
						</h3>
						<p className="text-foreground opacity-70 mb-6">
							{searchQuery || filterBy !== 'all'
								? 'Try adjusting your search or filters'
								: 'Start creating and saving outfits to build your virtual closet!'
							}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredOutfits.map((savedOutfit) => {
							const items = outfitItems[savedOutfit.id] || [];
							const coverIndex = coverImages[savedOutfit.id] || 0;
							const primaryItem = items[coverIndex] || items[0]; // Use cover image or first item
							const remainingItems = items.filter((_, index) => index !== coverIndex);

							return (
								<div
									key={savedOutfit.id}
									className="bg-background border border-border rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
									onClick={() => setSelectedOutfit(savedOutfit)}
								>
									{/* Outfit Preview */}
									<div className="aspect-square bg-gradient-to-br from-primary/30 to-accent/30 p-4 relative">
										{primaryItem?.image_url ? (
											<div className="relative w-full h-full">
												{/* Main item */}
												<div className="absolute inset-0 rounded-lg overflow-hidden">
													<Image
														src={primaryItem.image_url}
														alt={primaryItem.name}
														width={200}
														height={200}
														className="w-full h-full object-cover"
													/>
												</div>

												{/* Smaller items overlay - clickable */}
												{remainingItems.length > 0 && (
													<div className="absolute bottom-2 right-2 flex space-x-1">
														{remainingItems.slice(0, 3).map((item) => {
															const originalIndex = items.findIndex(originalItem => originalItem.id === item.id);
															return (
																<div
																	key={item.id}
																	className="w-8 h-8 rounded border-2 border-white shadow-sm overflow-hidden bg-background cursor-pointer hover:scale-110 transition-transform"
																	onClick={(e) => {
																		e.stopPropagation(); // Prevent opening the modal
																		setCoverImages(prev => ({
																			...prev,
																			[savedOutfit.id]: originalIndex
																		}));
																	}}
																>
																	{item.image_url ? (
																		<Image
																			src={item.image_url}
																			alt={item.name}
																			width={32}
																			height={32}
																			className="w-full h-full object-cover"
																		/>
																	) : (
																		<div className="w-full h-full bg-secondary flex items-center justify-center text-xs">
																			👔
																		</div>
																	)}
																</div>
															);
														})}
														{remainingItems.length > 3 && (
															<div className="w-8 h-8 rounded border-2 border-white shadow-sm bg-primary/80 flex items-center justify-center text-xs text-white font-medium">
																+{remainingItems.length - 3}
															</div>
														)}
													</div>
												)}
											</div>
										) : (
											<div className="w-full h-full flex flex-col items-center justify-center">
												<div className="text-4xl mb-2">👔</div>
												<div className="text-sm text-foreground opacity-70 text-center">
													{items.length} items
												</div>
											</div>
										)}
									</div>

									<div className="p-4">
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-semibold text-foreground text-sm">
												{savedOutfit.name || 'Unnamed Outfit'}
											</h3>
											{savedOutfit.is_favorite && (
												<Heart className="h-4 w-4 text-accent fill-current flex-shrink-0" />
											)}
										</div>

										<div className="text-xs text-foreground opacity-70 mb-2">
											{savedOutfit.occasion || 'Casual'}
										</div>

										{/* Item names preview */}
										{items.length > 0 && (
											<div className="text-xs text-foreground opacity-60 mb-2 line-clamp-2">
												{items.map(item => item.name).join(', ')}
											</div>
										)}

										<div className="flex items-center justify-between text-xs text-foreground opacity-60">
											<div className="flex items-center space-x-2">
												{savedOutfit.rating && (
													<div className="flex items-center space-x-1">
														<Star className="h-3 w-3 text-highlight fill-current" />
														<span>{savedOutfit.rating}</span>
													</div>
												)}
												{savedOutfit.worn_count && savedOutfit.worn_count > 0 && (
													<div className="flex items-center space-x-1">
														<span>👕</span>
														<span>{savedOutfit.worn_count}</span>
													</div>
												)}
											</div>
											<div>
												{savedOutfit.item_ids?.length || 0} items
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Outfit Detail Modal */}
				{selectedOutfit && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-background border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-foreground">
										{selectedOutfit.name || `${selectedOutfit.occasion || 'Saved'} Outfit`}
									</h2>
									<button
										onClick={() => setSelectedOutfit(null)}
										className="text-foreground/50 hover:text-foreground transition-colors text-xl"
									>
										✕
									</button>
								</div>

								{/* Outfit Items Display */}
								{outfitItems[selectedOutfit.id] && outfitItems[selectedOutfit.id].length > 0 && (
									<div className="mb-6">
										<h3 className="text-lg font-semibold text-foreground mb-3">
											Outfit Items
											<span className="text-sm font-normal text-foreground opacity-70 ml-2">
												(Click any item to set as cover)
											</span>
										</h3>
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{outfitItems[selectedOutfit.id].map((item, index) => {
												const isCurrentCover = (coverImages[selectedOutfit.id] || 0) === index;
												return (
													<div
														key={item.id}
														className={`bg-secondary/30 rounded-lg p-3 border cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${isCurrentCover ? 'border-primary shadow-lg ring-2 ring-primary/30' : 'border-border'
															}`}
														onClick={() => {
															setCoverImages(prev => ({
																...prev,
																[selectedOutfit.id]: index
															}));
														}}
													>
														<div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-2 overflow-hidden relative">
															{item.image_url ? (
																<Image
																	src={item.image_url}
																	alt={item.name}
																	width={150}
																	height={150}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center text-2xl">
																	👔
																</div>
															)}
															{isCurrentCover && (
																<div className="absolute top-2 right-2 bg-primary text-foreground text-xs px-2 py-1 rounded-full font-medium">
																	Cover
																</div>
															)}
														</div>
														<div className="text-sm font-medium text-foreground mb-1 line-clamp-1">
															{item.name}
														</div>
														<div className="text-xs text-foreground opacity-70 capitalize">
															{item.category}
														</div>
														{item.colors && item.colors.length > 0 && (
															<div className="flex space-x-1 mt-2">
																{item.colors.slice(0, 3).map((color, colorIndex) => (
																	<div
																		key={colorIndex}
																		className="w-3 h-3 rounded-full border border-border"
																		style={{ backgroundColor: color }}
																		title={color}
																	/>
																))}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								)}

								{/* Compatibility Score */}
								<div className="mb-4 p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-border">
									<div className="text-sm font-medium text-foreground">
										Compatibility: {selectedOutfit.compatibility_score || 0}% match
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center space-x-4 mb-6">
									<button
										onClick={() => {
											SavedOutfitService.toggleFavorite(selectedOutfit.id);
											fetchSavedOutfits();
											setSelectedOutfit({ ...selectedOutfit, is_favorite: !selectedOutfit.is_favorite });
										}}
										className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${selectedOutfit.is_favorite
											? 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30'
											: 'bg-secondary/50 text-foreground border border-border hover:bg-secondary'
											}`}
									>
										<Heart className={`h-4 w-4 ${selectedOutfit.is_favorite ? 'fill-current' : ''}`} />
										<span>{selectedOutfit.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
									</button>

									<button
										onClick={() => {
											SavedOutfitService.markAsWorn(selectedOutfit.id);
											fetchSavedOutfits();
										}}
										className="flex items-center space-x-2 px-4 py-2 bg-highlight/20 text-highlight border border-highlight/30 rounded-lg hover:bg-highlight/30 transition-all font-medium"
									>
										<span>👕</span>
										<span>Mark as Worn</span>
									</button>
								</div>

								{/* Rating */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-foreground mb-2">
										Your Rating
									</label>
									<div className="flex space-x-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												onClick={() => handleUpdateOutfit(selectedOutfit.id, { rating: star })}
												className={`h-8 w-8 ${star <= (selectedOutfit.rating || 0)
													? 'text-highlight fill-current'
													: 'text-foreground/30'
													} hover:text-highlight transition-colors`}
											>
												<Star className="h-full w-full" />
											</button>
										))}
									</div>
								</div>

								{/* Notes */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-foreground mb-2">
										Notes
									</label>
									<textarea
										value={selectedOutfit.notes || ''}
										onChange={(e) => setSelectedOutfit({ ...selectedOutfit, notes: e.target.value })}
										onBlur={(e) => handleUpdateOutfit(selectedOutfit.id, { notes: e.target.value })}
										placeholder="Add your thoughts about this outfit..."
										className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
										rows={3}
									/>
								</div>

								{/* Outfit Info */}
								<div className="grid grid-cols-2 gap-4 mb-6">
									<div>
										<div className="text-sm font-medium text-foreground">Created</div>
										<div className="text-sm text-foreground opacity-70">
											{new Date(selectedOutfit.created_at).toLocaleDateString()}
										</div>
									</div>
									<div>
										<div className="text-sm font-medium text-foreground">Items</div>
										<div className="text-sm text-foreground opacity-70">
											{selectedOutfit.item_ids?.length || 0} pieces
										</div>
									</div>
									{selectedOutfit.worn_count && selectedOutfit.worn_count > 0 && (
										<>
											<div>
												<div className="text-sm font-medium text-foreground">Worn Count</div>
												<div className="text-sm text-foreground opacity-70">{selectedOutfit.worn_count} times</div>
											</div>
											{selectedOutfit.last_worn_at && (
												<div>
													<div className="text-sm font-medium text-foreground">Last Worn</div>
													<div className="text-sm text-foreground opacity-70">
														{new Date(selectedOutfit.last_worn_at).toLocaleDateString()}
													</div>
												</div>
											)}
										</>
									)}
								</div>								{/* Actions */}
								<div className="flex justify-between">
									<button
										onClick={() => handleDeleteOutfit(selectedOutfit.id)}
										className="flex items-center space-x-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-all font-medium"
									>
										<Trash2 className="h-4 w-4" />
										<span>Delete Outfit</span>
									</button>

									<button
										onClick={() => setSelectedOutfit(null)}
										className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-foreground font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
