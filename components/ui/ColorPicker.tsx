'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ColorPickerProps {
	selectedColors: string[];
	onChange: (colors: string[]) => void;
	maxColors?: number;
}

const PRESET_COLORS = [
	// Neutrals
	'#000000', '#FFFFFF', '#808080', '#A9A9A9', '#D3D3D3', '#F5F5F5',
	'#8B4513', '#DEB887', '#F5DEB3', '#FFF8DC', '#FAEBD7',

	// Earth tones
	'#654321', '#8B7355', '#A0522D', '#CD853F', '#DAA520', '#B8860B',
	'#2F4F4F', '#556B2F', '#6B8E23', '#808000', '#9ACD32',

	// Blues
	'#000080', '#00008B', '#0000CD', '#0000FF', '#1E90FF', '#87CEEB',
	'#4682B4', '#5F9EA0', '#6495ED', '#87CEFA', '#B0C4DE', '#ADD8E6',

	// Greens
	'#006400', '#008000', '#228B22', '#32CD32', '#90EE90', '#98FB98',
	'#2E8B57', '#3CB371', '#66CDAA', '#20B2AA', '#48D1CC',

	// Reds/Pinks
	'#8B0000', '#DC143C', '#FF0000', '#FF6347', '#FA8072', '#FFA07A',
	'#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FFCCCB',

	// Purples
	'#4B0082', '#663399', '#8A2BE2', '#9400D3', '#9932CC', '#BA55D3',
	'#DA70D6', '#DDA0DD', '#E6E6FA', '#F8F8FF',

	// Yellows/Oranges
	'#FFD700', '#FFFF00', '#FFFFE0', '#FFFFF0', '#FFA500', '#FF8C00',
	'#FF7F50', '#FF6347', '#FF4500', '#OrangeRed'
];

export default function ColorPicker({ selectedColors, onChange, maxColors = 3 }: ColorPickerProps) {
	const [customColor, setCustomColor] = useState('#000000');

	const handleColorSelect = (color: string) => {
		if (selectedColors.includes(color)) {
			// Remove color if already selected
			onChange(selectedColors.filter(c => c !== color));
		} else if (selectedColors.length < maxColors) {
			// Add color if under limit
			onChange([...selectedColors, color]);
		}
	};

	const addCustomColor = () => {
		if (!selectedColors.includes(customColor) && selectedColors.length < maxColors) {
			onChange([...selectedColors, customColor]);
		}
	};

	const removeColor = (colorToRemove: string) => {
		onChange(selectedColors.filter(c => c !== colorToRemove));
	};

	return (
		<div className="space-y-4">
			{/* Selected Colors Display */}
			{selectedColors.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedColors.map((color, index) => (
						<div
							key={index}
							className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
						>
							<div
								className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
								style={{ backgroundColor: color }}
							/>
							<span className="text-sm font-medium text-gray-700">
								{color.toUpperCase()}
							</span>
							<button
								type="button"
								onClick={() => removeColor(color)}
								className="text-gray-400 hover:text-red-500 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Color Selection Info */}
			<div className="text-sm text-gray-600">
				Select up to {maxColors} colors ({selectedColors.length}/{maxColors} selected)
			</div>

			{/* Preset Colors Grid */}
			<div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
				{PRESET_COLORS.map((color, index) => (
					<button
						key={index}
						type="button"
						onClick={() => handleColorSelect(color)}
						className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${selectedColors.includes(color)
								? 'border-blue-500 ring-2 ring-blue-200'
								: 'border-gray-200 hover:border-gray-300'
							}`}
						style={{ backgroundColor: color }}
						title={color}
						disabled={selectedColors.length >= maxColors && !selectedColors.includes(color)}
					/>
				))}
			</div>

			{/* Custom Color Picker */}
			{selectedColors.length < maxColors && (
				<div className="flex items-center gap-3 pt-4 border-t border-gray-200">
					<label className="text-sm font-medium text-gray-700">Custom color:</label>
					<input
						type="color"
						value={customColor}
						onChange={(e) => setCustomColor(e.target.value)}
						className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
					/>
					<button
						type="button"
						onClick={addCustomColor}
						disabled={selectedColors.includes(customColor)}
						className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}
