"use client";

import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import { Item } from '../../lib/types';
import { ItemsService } from '@/lib/itemsService';
import Image from 'next/image';
import Link from 'next/link';

const RecentItemsSection = () => {
	const [recentItems, setRecentItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRecentItems = async () => {
			try {
				const items = await ItemsService.getRecentItems(4);
				setRecentItems(items);
			} catch (error) {
				console.error('Error fetching recent items:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRecentItems();
	}, []);

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		return `${Math.floor(diffInDays / 30)} months ago`;
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

	if (loading) {
		return (
			<section className="mb-8">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-foreground">
						Recently Added
					</h2>
					<Link href="/browse" className="text-highlight hover:underline text-sm font-medium">
						View All
					</Link>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, index) => (
						<Card key={index} className="animate-pulse">
							<div className="space-y-3">
								<div className="w-full h-32 bg-gray-200 rounded-lg"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded"></div>
									<div className="h-3 bg-gray-200 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="mb-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-foreground">
					Recently Added
				</h2>
				<Link href="/browse" className="text-highlight hover:underline text-sm font-medium">
					View All
				</Link>
			</div>

			{recentItems.length === 0 ? (
				<div className="text-center py-12 text-gray-500">
					<div className="text-4xl mb-4">👗</div>
					<p className="text-lg font-medium mb-2">No items yet</p>
					<p className="text-sm">Start by adding your first item to your closet!</p>
					<Link
						href="/new"
						className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-primary to-accent text-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all"
					>
						Add Your First Item
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{recentItems.map((item) => (
						<Card key={item.id} hover className="group">
							<div className="space-y-3">
								{/* Item image or placeholder */}
								<div className="w-full h-32 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 overflow-hidden">
									{item.image_url ? (
										<Image
											src={item.image_url}
											alt={item.name}
											width={128}
											height={128}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-3xl opacity-60">
											{getCategoryEmoji(item.category)}
										</span>
									)}
								</div>

								<div className="space-y-1">
									<h3 className="font-semibold text-foreground text-sm leading-tight">
										{item.name}
									</h3>
									<div className="flex items-center justify-between text-xs text-foreground opacity-70">
										<span className="capitalize">{item.category}</span>
										<div className="flex items-center space-x-1">
											{item.colors && item.colors.length > 0 ? (
												<>
													<div
														className="w-3 h-3 rounded-full border border-gray-400"
														style={{ backgroundColor: item.colors[0] }}
														title={item.colors[0]}
													/>
													<span className="text-xs">
														{item.colors.length > 1 ? `+${item.colors.length - 1}` : ''}
													</span>
												</>
											) : (
												<span>No color</span>
											)}
										</div>
									</div>
									<p className="text-xs text-foreground opacity-50">
										{item.created_at ? formatDate(item.created_at) : 'Unknown date'}
									</p>
									{item.tags && item.tags.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{item.tags.slice(0, 2).map((tag, index) => (
												<span
													key={index}
													className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full"
												>
													{tag}
												</span>
											))}
											{item.tags.length > 2 && (
												<span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
													+{item.tags.length - 2}
												</span>
											)}
										</div>
									)}
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</section>
	);
};

export default RecentItemsSection;
