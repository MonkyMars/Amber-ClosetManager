const HeroSection = () => {
	return (
		<section className="text-center py-12 mb-8">
			<div className="max-w-3xl mx-auto">
				<div className="mb-6">
					<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-sm font-medium text-foreground mb-4">
						<span>✨</span>
						<span>Your Personal Style Assistant</span>
					</div>
				</div>

				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
					Welcome to Your
					<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						Dream Closet
					</span>
				</h1>

				<p className="text-lg text-foreground opacity-70 mb-8 leading-relaxed max-w-2xl mx-auto">
					Organize, plan, and discover your perfect style. Your wardrobe has never been more beautiful or accessible.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<button className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-foreground font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
						Start Organizing
					</button>
					<button className="px-8 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-all duration-200">
						Browse Collection
					</button>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
