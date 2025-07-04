"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown } from "lucide-react";

type SelectProps = {
	name: string;
	label: string;
	options: { value: string; label: string }[];
	value: string | string[];
	onChange?: (value: string | string[]) => void;
	placeholder?: string;
	multiple?: boolean;
	required?: boolean;
};

const SelectComponent: React.FC<SelectProps> = ({
	name,
	label,
	options,
	value,
	onChange,
	placeholder = "Select an option",
	multiple = false,
	required = false
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSingleSelect = (selectedValue: string) => {
		onChange?.(selectedValue);
	};

	const handleMultiSelect = (selectedValue: string) => {
		const currentValues = Array.isArray(value) ? value : [];
		const newValues = currentValues.includes(selectedValue)
			? currentValues.filter(v => v !== selectedValue)
			: [...currentValues, selectedValue];
		onChange?.(newValues);
	};

	const removeTag = (tagToRemove: string) => {
		if (Array.isArray(value)) {
			const newValues = value.filter(v => v !== tagToRemove);
			onChange?.(newValues);
		}
	};

	const getDisplayValue = () => {
		if (multiple && Array.isArray(value)) {
			return value.length > 0 ? `${value.length} selected` : placeholder;
		}
		if (!multiple && typeof value === 'string') {
			const option = options.find(opt => opt.value === value);
			return option ? option.label : placeholder;
		}
		return placeholder;
	};

	if (multiple) {
		return (
			<div className="space-y-2" ref={dropdownRef}>
				<label className="text-sm font-medium text-gray-700" htmlFor={name}>
					{label} {required && <span className="text-red-500">*</span>}
				</label>
				<div className="relative">
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
					>
						<div className="flex items-center justify-between">
							<span className="text-gray-700">{getDisplayValue()}</span>
							<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
						</div>
					</button>

					{isOpen && (
						<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
							{options.map((option) => {
								const isSelected = Array.isArray(value) && value.includes(option.value);
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => handleMultiSelect(option.value)}
										className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
											}`}
									>
										<div className="flex items-center justify-between">
											<span>{option.label}</span>
											{isSelected && <span className="text-blue-600">✓</span>}
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Selected tags display */}
				{Array.isArray(value) && value.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{value.map((selectedValue) => {
							const option = options.find(opt => opt.value === selectedValue);
							return (
								<span
									key={selectedValue}
									className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
								>
									{option?.label || selectedValue}
									<button
										type="button"
										onClick={() => removeTag(selectedValue)}
										className="ml-2 hover:text-blue-600"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							);
						})}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-gray-700" htmlFor={name}>
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<Select name={name} onValueChange={handleSingleSelect} value={value as string}>
				<SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value} className="hover:bg-gray-50">
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default SelectComponent;
