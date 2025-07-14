"use client";

import SelectComponent from "@/components/ui/SelectComponent";
import ColorPicker from "@/components/ui/ColorPicker";
import { FormData } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { ITEM_CATEGORIES, STYLE_TAGS } from "@/lib/constants";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Image as ImageIcon, Loader2, CheckCircle, XCircle } from "lucide-react";

const New = () => {
	const router = useRouter();
	const [formData, setFormData] = useState<FormData>({
		name: "",
		category: "",
		description: "",
		colors: [],
		tags: [],
		image_url: "",
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const uploadImage = async (file: File): Promise<string | null> => {
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${Date.now()}.${fileExt}`;

			const { error: uploadError } = await supabase.storage
				.from('item-images')
				.upload(fileName, file);

			if (uploadError) {
				console.error('Upload error:', uploadError);
				return null;
			}

			const { data } = supabase.storage
				.from('item-images')
				.getPublicUrl(fileName);

			return data.publicUrl;
		} catch (error) {
			console.error('Error uploading image:', error);
			return null;
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			let imageUrl = formData.image_url;

			// Upload image if one was selected
			if (imageFile) {
				const uploadedImageUrl = await uploadImage(imageFile);
				if (!uploadedImageUrl) {
					throw new Error('Failed to upload image');
				}
				imageUrl = uploadedImageUrl;
			}

			// Prepare data for insertion
			const itemData = {
				name: formData.name,
				category: formData.category,
				description: formData.description,
				colors: formData.colors,
				tags: formData.tags,
				image_url: imageUrl || null,
			};

			// Insert into Supabase
			const { error } = await supabase
				.from('items')
				.insert([itemData])
				.select();

			if (error) {
				throw error;
			}

			setMessage({ type: 'success', text: 'Item added successfully!' });

			// Reset form
			setFormData({
				name: "",
				category: "",
				description: "",
				colors: [],
				tags: [],
				image_url: "",
			});
			setImageFile(null);
			setImagePreview("");

			// Redirect to success page
			setTimeout(() => {
				router.push('/success');
			}, 1500);

		} catch (error: unknown) {
			console.error('Error adding item:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
			setMessage({ type: 'error', text: errorMessage });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 md:p-6">
			<div className="max-w-2xl mx-auto">
				<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
					{/* Header */}
					<header className="text-center mb-8">
						<div className="mb-6">
							<div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-sm font-medium text-foreground mb-4">
								<span>✨</span>
								<span>Update Your Closet</span>
							</div>
						</div>
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
							Add New
							<span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Item
							</span>
						</h1>
						<p className="text-gray-600 text-lg">Fill in the details below to add a new item to your closet</p>
					</header>

					{/* Message */}
					{message && (
						<div className={`flex items-center space-x-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
							}`}>
							{message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
							<span>{message.text}</span>
						</div>
					)}

					{/* Form Fields */}
					<div className="space-y-6">
						{/* Image Upload */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Item Photo
							</label>
							<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
								<div className="space-y-2 text-center">
									{imagePreview ? (
										<div className="relative">
											<Image
												src={imagePreview}
												alt="Preview"
												width={200}
												height={200}
												className="mx-auto h-48 w-48 object-cover rounded-lg"
											/>
											<button
												type="button"
												onClick={() => {
													setImagePreview("");
													setImageFile(null);
												}}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
											>
												<XCircle className="h-4 w-4" />
											</button>
										</div>
									) : (
										<ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
									)}
									<div className="flex text-sm text-gray-600">
										<label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
											<span>{imagePreview ? 'Change photo' : 'Upload a photo'}</span>
											<input
												id="image-upload"
												name="image-upload"
												type="file"
												className="sr-only"
												accept="image/*"
												onChange={handleImageUpload}
											/>
										</label>
										<p className="pl-1">or drag and drop</p>
									</div>
									<p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
								</div>
							</div>
						</div>

						{/* Item Name */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700" htmlFor="name">
								Item Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								required
								name="name"
								id="name"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="e.g. Red Summer Dress"
								onChange={onChange}
								value={formData.name}
							/>
						</div>

						{/* Category */}
						<SelectComponent
							name="category"
							label="Category"
							options={ITEM_CATEGORIES}
							value={formData.category}
							placeholder="Select the category that describe this item best"
							onChange={(value) => {
								setFormData((prevData) => ({
									...prevData,
									category: value as string,
								}));
							}}
						/>
						{/* Description */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700" htmlFor="description">
								Description <span className="text-red-500">*</span>
							</label>
							<textarea
								name="description"
								id="description"
								required
								rows={4}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="Describe the item, its condition, style, and any other details..."
								onChange={onChange}
								value={formData.description}
							/>
						</div>

						{/* Colors */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Colors <span className="text-red-500">*</span>
							</label>
							<ColorPicker
								selectedColors={formData.colors}
								onChange={(colors) => setFormData(prev => ({ ...prev, colors }))}
								maxColors={3}
							/>
						</div>

						{/* Tags */}
						<SelectComponent
							name="tags"
							label="Tags"
							multiple
							options={STYLE_TAGS}
							value={formData.tags}
							placeholder="Select tags that describe this item"
							onChange={(value) => {
								setFormData((prevData) => ({
									...prevData,
									tags: value as string[],
								}));
							}}
						/>
					</div>

					{/* Submit Button */}
					<div className="pt-6">
						<button
							type="submit"
							disabled={isLoading || !formData.name || !formData.category || !formData.description || formData.colors.length === 0}
							className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-foreground bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
						>
							{isLoading ? (
								<>
									<Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
									Adding Item...
								</>
							) : (
								<>
									<Upload className="-ml-1 mr-3 h-5 w-5" />
									Add Item to Closet
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default New;