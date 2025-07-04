'use client';

import { useState } from 'react';
import { MoodService } from '@/lib/moodService';
import { Mood } from '@/lib/types';
import Card from '@/components/ui/Card';
import SelectComponent from '@/components/ui/SelectComponent';
import { X, Plus } from 'lucide-react';

interface CreateMoodModalProps {
	isOpen: boolean;
	onClose: () => void;
	onMoodCreated: (mood: Mood) => void;
}

const vibeOptions = [
	{ label: 'Casual', value: 'casual' },
	{ label: 'Formal', value: 'formal' },
	{ label: 'Cozy', value: 'cozy' },
	{ label: 'Edgy', value: 'edgy' },
	{ label: 'Romantic', value: 'romantic' },
	{ label: 'Professional', value: 'professional' },
	{ label: 'Sporty', value: 'sporty' },
	{ label: 'Bohemian', value: 'bohemian' }
];

const colorOptions = [
	{ label: 'Black', value: '#000000' },
	{ label: 'White', value: '#FFFFFF' },
	{ label: 'Gray', value: '#808080' },
	{ label: 'Navy', value: '#000080' },
	{ label: 'Red', value: '#FF0000' },
	{ label: 'Pink', value: '#FFC0CB' },
	{ label: 'Purple', value: '#800080' },
	{ label: 'Blue', value: '#0000FF' },
	{ label: 'Green', value: '#008000' },
	{ label: 'Yellow', value: '#FFFF00' },
	{ label: 'Orange', value: '#FFA500' },
	{ label: 'Brown', value: '#8B4513' },
	{ label: 'Beige', value: '#F5F5DC' },
	{ label: 'Cream', value: '#FFFDD0' }
];

const emojiOptions = ['🌸', '💼', '☕', '🖤', '💖', '✨', '🌻', '🏃‍♀️', '🎨', '🌙', '☀️', '🔥'];

export default function CreateMoodModal({ isOpen, onClose, onMoodCreated }: CreateMoodModalProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		vibe: 'casual' as Mood['vibe'],
		emoji: '✨',
		colors: [] as string[],
		tags: [] as string[]
	});
	const [tagInput, setTagInput] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim() || formData.colors.length === 0) {
			return;
		}

		setLoading(true);

		try {
			const mood = await MoodService.createMood(formData);
			if (mood) {
				onMoodCreated(mood);
				onClose();
				setFormData({
					title: '',
					description: '',
					vibe: 'casual',
					emoji: '✨',
					colors: [],
					tags: []
				});
				setTagInput('');
			}
		} catch (error) {
			console.error('Error creating mood:', error);
		} finally {
			setLoading(false);
		}
	};

	const addTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData(prev => ({
				...prev,
				tags: [...prev.tags, tagInput.trim()]
			}));
			setTagInput('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData(prev => ({
			...prev,
			tags: prev.tags.filter(tag => tag !== tagToRemove)
		}));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-semibold text-gray-900">Create New Mood</h3>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Mood Title *
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							placeholder="e.g., Spring Vibes, Office Chic"
							required
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
							value={formData.description}
							onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							rows={3}
							placeholder="Describe the vibe and style of this mood..."
						/>
					</div>

					{/* Vibe */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Vibe *
						</label>
						<SelectComponent
							name="vibe"
							label=""
							options={vibeOptions}
							value={formData.vibe}
							onChange={(value) => setFormData(prev => ({ ...prev, vibe: value as Mood['vibe'] }))}
							placeholder="Select a vibe"
						/>
					</div>

					{/* Emoji */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Emoji
						</label>
						<div className="flex flex-wrap gap-2">
							{emojiOptions.map((emoji) => (
								<button
									key={emoji}
									type="button"
									onClick={() => setFormData(prev => ({ ...prev, emoji }))}
									className={`p-2 text-2xl rounded-lg border-2 transition-colors ${formData.emoji === emoji
											? 'border-purple-500 bg-purple-50'
											: 'border-gray-200 hover:border-gray-300'
										}`}
								>
									{emoji}
								</button>
							))}
						</div>
					</div>

					{/* Colors */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Colors * (Select multiple)
						</label>
						<SelectComponent
							name="colors"
							label=""
							options={colorOptions}
							value={formData.colors}
							onChange={(value) => setFormData(prev => ({ ...prev, colors: value as string[] }))}
							placeholder="Select colors"
							multiple
						/>
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.colors.map((color, index) => (
								<div
									key={index}
									className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
									style={{ backgroundColor: color }}
									title={colorOptions.find(opt => opt.value === color)?.label || color}
								/>
							))}
						</div>
					</div>

					{/* Tags */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tags
						</label>
						<div className="flex gap-2 mb-2">
							<input
								type="text"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyPress={handleKeyPress}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="Add a tag and press Enter"
							/>
							<button
								type="button"
								onClick={addTag}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
							>
								<Plus className="w-4 h-4" />
							</button>
						</div>
						<div className="flex flex-wrap gap-2">
							{formData.tags.map((tag, index) => (
								<span
									key={index}
									className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
								>
									{tag}
									<button
										type="button"
										onClick={() => removeTag(tag)}
										className="text-purple-600 hover:text-purple-800"
									>
										<X className="w-3 h-3" />
									</button>
								</span>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || !formData.title.trim() || formData.colors.length === 0}
							className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? 'Creating...' : 'Create Mood'}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
}
