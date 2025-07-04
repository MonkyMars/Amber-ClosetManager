"use client";

import React from "react";
import { CheckCircle, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

const SuccessPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
				<div className="mb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Item Added Successfully!
					</h1>
					<p className="text-gray-600">
						Your new item has been added to your closet and is ready to be styled.
					</p>
				</div>

				<div className="space-y-3">
					<Link
						href="/"
						className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
					>
						<ArrowLeft className="mr-2 h-5 w-5" />
						Back to Home
					</Link>

					<Link
						href="/new"
						className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
					>
						<Plus className="mr-2 h-5 w-5" />
						Add Another Item
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SuccessPage;
