"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Search, Sparkles, Palette } from "lucide-react";

const MobileNav = () => {
	const pathname = usePathname();

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/browse', label: 'Browse', icon: Search },
		{ href: '/moods', label: 'Moods', icon: Palette },
		{ href: '/new', label: 'Add', icon: Plus },
		{ href: '/outfits', label: 'Outfits', icon: Sparkles },
	];

	const isActive = (href: string) => {
		return pathname === href;
	};

	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
			<div className="flex items-center justify-around">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${active
									? 'text-blue-600'
									: 'text-gray-500 hover:text-gray-700'
								}`}
						>
							<Icon className={`h-5 w-5 ${active ? 'text-blue-600' : ''}`} />
							<span className={`text-xs font-medium ${active ? 'text-blue-600' : ''}`}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default MobileNav;
