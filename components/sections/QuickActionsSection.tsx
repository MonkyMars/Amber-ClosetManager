import Card from '../ui/Card';
import Link from 'next/link';

interface QuickAction {
	title: string;
	description: string;
	icon: string;
	gradient: string;
	href: string;
}

const QuickActionsSection = () => {
	const actions: QuickAction[] = [
		{
			title: 'Add New Item',
			description: 'Upload photos and details of your latest clothing pieces',
			icon: '📸',
			gradient: 'from-blue-600 to-purple-600',
			href: '/new'
		},
		{
			title: 'Generate Outfit',
			description: 'Let AI create amazing outfit combinations from your closet',
			icon: '✨',
			gradient: 'from-purple-600 to-pink-600',
			href: '/outfits'
		},
		{
			title: 'Browse Closet',
			description: 'Explore your collection by categories, colors, or seasons',
			icon: '👀',
			gradient: 'from-green-600 to-blue-600',
			href: '/browse'
		},
		{
			title: 'Style Analytics',
			description: 'Discover insights about your fashion preferences',
			icon: '📊',
			gradient: 'from-orange-300 to-red-600',
			href: '/analytics'
		}
	];

	return (
		<section className="mb-8">
			<h2 className="text-2xl font-bold text-foreground mb-6">
				Quick Actions
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{actions.map((action, index) => (
					<Link key={index} href={action.href}>
						<Card hover className="group h-full cursor-pointer">
							<div className="flex items-start space-x-4">
								<div className={`
	                w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} 
	                flex items-center justify-center text-xl flex-shrink-0
	                group-hover:scale-110 transition-transform duration-200
	              `}>
									{action.icon}
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-foreground mb-2">
										{action.title}
									</h3>
									<p className="text-foreground opacity-70 text-sm leading-relaxed">
										{action.description}
									</p>
								</div>
							</div>
						</Card>
					</Link>
				))}
			</div>
		</section>
	);
};

export default QuickActionsSection;
