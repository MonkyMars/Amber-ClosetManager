"use client";

import { useEffect, useState } from 'react';
import { ItemsService } from '@/lib/itemsService';
import { Item } from '@/lib/types';
import SelectComponent from '@/components/ui/SelectComponent';
import { Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import Image from 'next/image';

interface FilterOptions {
	categories: string[];
	tags: string[];
	colors: string[];
}

interface Filters {
	category: string;
	tags: string[];
	colors: string[];
	search: string;
}

const BrowsePage = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [filteredItems, setFilteredItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterOptions, setFilterOptions] = useState<FilterOptions>({
		categories: [],
		tags: [],
		colors: []
	});

	const [filters, setFilters] = useState<Filters>({
		category: '',
		tags: [],
		colors: [],
		search: ''
	});

	const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'category'>('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [showFilters, setShowFilters] = useState(false);

	// Fetch initial data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [itemsData, options] = await Promise.all([
					ItemsService.getItems({ sortBy, sortOrder }),
					ItemsService.getFilterOptions()
				]);

				setItems(itemsData.items);
				setFilteredItems(itemsData.items);
				setFilterOptions(options);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [sortBy, sortOrder]);

	// Apply filters whenever filters change
	useEffect(() => {
		let filtered = [...items];

		// Apply search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(item =>
				item.name.toLowerCase().includes(searchLower) ||
				item.description.toLowerCase().includes(searchLower) ||
				item.category.toLowerCase().includes(searchLower) ||
				item.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
				item.colors?.some(color => color.toLowerCase().includes(searchLower))
			);
		}

		// Apply category filter
		if (filters.category) {
			filtered = filtered.filter(item => item.category === filters.category);
		}

		// Apply tags filter
		if (filters.tags.length > 0) {
			filtered = filtered.filter(item =>
				item.tags?.some(tag => filters.tags.includes(tag))
			);
		}

		// Apply colors filter
		if (filters.colors.length > 0) {
			filtered = filtered.filter(item =>
				item.colors?.some(color => filters.colors.includes(color))
			);
		}

		setFilteredItems(filtered);
	}, [filters, items]);

	const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
		setFilters(prev => ({
			...prev,
			[key]: value
		}));
	};

	const clearFilters = () => {
		setFilters({
			category: '',
			tags: [],
			colors: [],
			search: ''
		});
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

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString();
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 md:p-6">
				<div className="max-w-7xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{[...Array(8)].map((_, i) => (
								<div key={i} className="bg-white rounded-lg p-4">
									<div className="h-32 bg-gray-200 rounded mb-4"></div>
									<div className="h-4 bg-gray-200 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 rounded w-3/4"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 md:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
							Browse Your Closet
						</h1>
						<p className="text-gray-600">
							{filteredItems.length} of {items.length} items
						</p>
					</div>

					{/* View Mode Toggle */}
					<div className="flex items-center space-x-4 mt-4 md:mt-0">
						<div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded ${viewMode === 'grid'
									? 'bg-blue-100 text-blue-600'
									: 'text-gray-400 hover:text-gray-600'
									}`}
							>
								<Grid className="h-5 w-5" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded ${viewMode === 'list'
									? 'bg-blue-100 text-blue-600'
									: 'text-gray-400 hover:text-gray-600'
									}`}
							>
								<List className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-8">
					{/* Search Bar */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							placeholder="Search items by name, category, tags, or colors..."
							value={filters.search}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{/* Filter Toggle */}
					<div className="flex items-center justify-between">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
						>
							<Filter className="h-5 w-5" />
							<span>Filters</span>
						</button>

						{/* Sort Controls */}
						<div className="flex items-center space-x-4">
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="created_at">Date Added</option>
								<option value="name">Name</option>
								<option value="category">Category</option>
							</select>

							<button
								onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
								className="p-2 text-gray-400 hover:text-gray-600"
							>
								{sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
							</button>
						</div>
					</div>

					{/* Filters */}
					{showFilters && (
						<div className="mt-6 pt-6 border-t border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<SelectComponent
									name="category"
									label="Category"
									options={filterOptions.categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
									value={filters.category}
									placeholder="All categories"
									onChange={(value) => handleFilterChange('category', value as string)}
								/>

								<SelectComponent
									name="tags"
									label="Tags"
									multiple
									options={filterOptions.tags.map(tag => ({ value: tag, label: tag.charAt(0).toUpperCase() + tag.slice(1) }))}
									value={filters.tags}
									placeholder="Select tags"
									onChange={(value) => handleFilterChange('tags', value as string[])}
								/>

								{/* Custom Color Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Colors
									</label>
									<div className="border border-gray-300 rounded-lg p-3 bg-white">
										<div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
											{filterOptions.colors.map((color) => (
												<button
													key={color}
													onClick={() => {
														const newColors = filters.colors.includes(color)
															? filters.colors.filter(c => c !== color)
															: [...filters.colors, color];
														handleFilterChange('colors', newColors);
													}}
													className={`flex items-center space-x-1 px-2 py-1 rounded-full border transition-colors ${filters.colors.includes(color)
														? 'border-blue-500 bg-blue-50'
														: 'border-gray-300 hover:border-gray-400'
														}`}
													title={color}
												>
													<div
														className="w-3 h-3 rounded-full border border-gray-400"
														style={{ backgroundColor: color }}
													/>
													<span className="text-xs">
														{color.length === 7 ? color.toUpperCase() : color}
													</span>
												</button>
											))}
										</div>
										{filterOptions.colors.length === 0 && (
											<p className="text-sm text-gray-500">No colors available</p>
										)}
									</div>
								</div>
							</div>

							<div className="mt-4 flex justify-end">
								<button
									onClick={clearFilters}
									className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
								>
									Clear all filters
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Items Grid/List */}
				{filteredItems.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<div className="text-4xl mb-4">🔍</div>
						<p className="text-lg font-medium mb-2">No items found</p>
						<p className="text-sm">Try adjusting your search or filters</p>
					</div>
				) : (
					<div className={
						viewMode === 'grid'
							? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
							: 'space-y-4'
					}>
						{filteredItems.map((item) => (
							<div
								key={item.id}
								className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${viewMode === 'list' ? 'p-4 flex items-center space-x-4' : 'p-4'
									}`}
							>
								{/* Image */}
								<div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-full h-48'
									} bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center overflow-hidden mb-4`}>
									{item.image_url ? (
										<Image
											src={item.image_url}
											alt={item.name}
											width={viewMode === 'list' ? 64 : 192}
											height={viewMode === 'list' ? 64 : 192}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className={`${viewMode === 'list' ? 'text-xl' : 'text-4xl'} opacity-60`}>
											{getCategoryEmoji(item.category)}
										</span>
									)}
								</div>

								{/* Content */}
								<div className={viewMode === 'list' ? 'flex-1' : ''}>
									<h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
									<p className="text-sm text-gray-600 capitalize mb-2">{item.category}</p>

									{viewMode === 'grid' && (
										<p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
									)}

									{/* Colors */}
									{item.colors && item.colors.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-2">
											{item.colors.slice(0, 3).map((color, index) => (
												<div
													key={index}
													className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full"
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
											{item.colors.length > 3 && (
												<span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
													+{item.colors.length - 3} more
												</span>
											)}
										</div>
									)}

									{/* Tags */}
									{item.tags && item.tags.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-2">
											{item.tags.slice(0, 2).map((tag, index) => (
												<span
													key={index}
													className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full"
												>
													{tag}
												</span>
											))}
											{item.tags.length > 2 && (
												<span className="text-xs px-2 py-1 bg-blue-100 text-blue-500 rounded-full">
													+{item.tags.length - 2}
												</span>
											)}
										</div>
									)}

									<p className="text-xs text-gray-400">
										Added {item.created_at ? formatDate(item.created_at) : 'Unknown date'}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default BrowsePage;
