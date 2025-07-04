"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Search, Sparkles, BarChart3, Palette } from "lucide-react";

const Navigation = () => {
	const pathname = usePathname();

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/browse', label: 'Browse', icon: Search },
		{ href: '/moods', label: 'Moods', icon: Palette },
		{ href: '/outfits', label: 'Outfits', icon: Sparkles },
		{ href: '/analytics', label: 'Analytics', icon: BarChart3 },
	];

	const isActive = (href: string) => {
		return pathname === href;
	};

	return (
		<nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
			<div className="flex items-center space-x-2">
				<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-lg">✨</span>
				</div>
				<h2 className="text-gray-900 text-xl font-semibold">
					<Link href={'/'}>Amber&apos;s Closet Manager</Link>
				</h2>
			</div>

			{/* Desktop Navigation */}
			<div className="hidden md:flex items-center space-x-1">
				{navItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
								? 'bg-blue-100 text-blue-700'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}`}
						>
							<Icon className="h-4 w-4" />
							<span>{item.label}</span>
						</Link>
					);
				})}

				<Link
					href={'/new'}
					className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all ml-4"
				>
					<Plus className="h-4 w-4" />
					<span>Add Item</span>
				</Link>
			</div>

			{/* Mobile Navigation Button */}
			<div className="md:hidden">
				<Link
					href={'/new'}
					className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
				>
					<Plus className="h-4 w-4" />
					<span>Add</span>
				</Link>
			</div>
		</nav>
	);
};

export default Navigation;
