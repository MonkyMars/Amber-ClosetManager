"use client";

import { useEffect, useState } from 'react';
import { ItemsService, CategoryStats, TagStats } from '@/lib/itemsService';
import { BarChart3, TrendingUp, Palette, Tag, Calendar, Target } from 'lucide-react';

const AnalyticsPage = () => {
	const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
	const [tagStats, setTagStats] = useState<TagStats[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAnalytics = async () => {
			try {
				const [categories, tags] = await Promise.all([
					ItemsService.getCategoryStats(),
					ItemsService.getTagStats()
				]);

				setCategoryStats(categories);
				setTagStats(tags);
			} catch (error) {
				console.error('Error fetching analytics:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchAnalytics();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 p-4 md:p-6">
				<div className="max-w-6xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="bg-white rounded-lg p-6">
									<div className="h-4 bg-gray-200 rounded mb-4"></div>
									<div className="h-32 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const totalItems = categoryStats.reduce((sum, cat) => sum + cat.count, 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 p-4 md:p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-orange-600 px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
						<BarChart3 className="h-4 w-4" />
						<span>Style Analytics</span>
					</div>
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Your Fashion
						<span className="block bg-gradient-to-r from-indigo-600 to-orange-600 bg-clip-text text-transparent">
							Insights
						</span>
					</h1>
					<p className="text-gray-600 text-lg max-w-2xl mx-auto">
						Discover patterns in your style preferences and wardrobe composition
					</p>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Total Items</p>
								<p className="text-2xl font-bold text-gray-900">{totalItems}</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
								<Target className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Categories</p>
								<p className="text-2xl font-bold text-gray-900">{categoryStats.length}</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<Palette className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Style Tags</p>
								<p className="text-2xl font-bold text-gray-900">{tagStats.length}</p>
							</div>
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
								<Tag className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Growth</p>
								<p className="text-2xl font-bold text-gray-900">+12%</p>
							</div>
							<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
								<TrendingUp className="h-6 w-6 text-orange-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Category Distribution */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
						<div className="space-y-4">
							{categoryStats.map((category, index) => {
								const percentage = totalItems > 0 ? (category.count / totalItems) * 100 : 0;
								const colors = [
									'bg-blue-500',
									'bg-green-500',
									'bg-purple-500',
									'bg-orange-500',
									'bg-red-500',
									'bg-indigo-500',
									'bg-pink-500',
									'bg-yellow-500'
								];

								return (
									<div key={category.category}>
										<div className="flex items-center justify-between mb-1">
											<span className="text-sm font-medium text-gray-700 capitalize">
												{category.category}
											</span>
											<span className="text-sm text-gray-500">
												{category.count} ({Math.round(percentage)}%)
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className={`h-2 rounded-full ${colors[index % colors.length]}`}
												style={{ width: `${percentage}%` }}
											></div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Top Style Tags */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Style Tags</h3>
						<div className="space-y-3">
							{tagStats.slice(0, 8).map((tag, index) => (
								<div key={tag.tag} className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
											{index + 1}
										</div>
										<span className="text-sm font-medium text-gray-700 capitalize">
											{tag.tag}
										</span>
									</div>
									<span className="text-sm text-gray-500">{tag.count} items</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Style Insights */}
				<div className="mt-8 bg-white rounded-lg shadow-sm p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Style Insights</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
							<div className="flex items-center space-x-2 mb-2">
								<Calendar className="h-5 w-5 text-blue-600" />
								<h4 className="font-medium text-gray-900">Seasonal Preference</h4>
							</div>
							<p className="text-sm text-gray-600">
								Based on your tags, you seem to prefer versatile pieces that work across seasons.
							</p>
						</div>

						<div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
							<div className="flex items-center space-x-2 mb-2">
								<TrendingUp className="h-5 w-5 text-green-600" />
								<h4 className="font-medium text-gray-900">Style Evolution</h4>
							</div>
							<p className="text-sm text-gray-600">
								Your recent additions show a trend towards more casual and comfortable pieces.
							</p>
						</div>
					</div>
				</div>

				{/* Coming Soon */}
				<div className="mt-8 bg-gradient-to-r from-indigo-100 to-orange-100 rounded-lg p-6 text-center">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
					<p className="text-gray-600">
						Advanced analytics including wear frequency tracking, outfit performance metrics,
						and personalized style recommendations.
					</p>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
