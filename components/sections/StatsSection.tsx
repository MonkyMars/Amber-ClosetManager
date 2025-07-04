"use client";

import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import { ItemsService, StatsData } from '@/lib/itemsService';

interface StatItem {
	label: string;
	value: string | number;
	icon: string;
	color?: string;
}

const StatsSection = () => {
	const [stats, setStats] = useState<StatsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const data = await ItemsService.getStats();
				setStats(data);
			} catch (error) {
				console.error('Error fetching stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const formatLastAdded = (dateString: string | null): string => {
		if (!dateString) return 'Never';

		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		return `${Math.floor(diffInDays / 30)} months ago`;
	};

	const getStatsItems = (): StatItem[] => {
		if (!stats) {
			return [
				{ label: 'Total Items', value: '--', icon: '👗', color: '#e7c6ff' },
				{ label: 'Recent Items', value: '--', icon: '💖', color: '#ffcfd2' },
				{ label: 'Categories', value: '--', icon: '📂', color: '#cde8e5' },
				{ label: 'Last Added', value: '--', icon: '✨', color: '#b8c0ff' }
			];
		}

		return [
			{
				label: 'Total Items',
				value: stats.totalItems,
				icon: '👗',
				color: '#e7c6ff'
			},
			{
				label: 'Recent Items',
				value: stats.recentItemsCount,
				icon: '💖',
				color: '#ffcfd2'
			},
			{
				label: 'Categories',
				value: stats.totalCategories,
				icon: '📂',
				color: '#cde8e5'
			},
			{
				label: 'Last Added',
				value: formatLastAdded(stats.lastAddedDate),
				icon: '✨',
				color: '#b8c0ff'
			}
		];
	};

	const statsItems = getStatsItems();

	return (
		<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{statsItems.map((stat, index) => (
				<Card key={index} hover className="text-center">
					<div
						className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-xl"
						style={{ backgroundColor: stat.color }}
					>
						{stat.icon}
					</div>
					<h3 className={`text-2xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
						{stat.value}
					</h3>
					<p className="text-foreground opacity-70 text-sm">
						{stat.label}
					</p>
				</Card>
			))}
		</section>
	);
};

export default StatsSection;
