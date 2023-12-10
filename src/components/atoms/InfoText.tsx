import React, { useState } from "react";
import { v4 } from "uuid";

const InfoTextReact = ({ text, title }) => {
	// have the uuid shorter
	const uuid = v4().split("-")[0];
	const popoverId = `popover-${uuid}`;

	const [isVisible, setIsVisible] = useState(false);

	const togglePopover = (event) => {
		event.stopPropagation();
		setIsVisible(!isVisible);
	};

	return (
		<>
			<button
				type="button"
				className="text-slate-200 light:hover:bg-slate-600 light:focus:ring-1 focus:outline-none focus:ring-blue-300 font-semibold rounded-full text-sm text-center bg-slate-700 light:bg-sky-300 light:hover:bg-sky-600 hover:bg-sky-700 focus:ring-blue-800 px-2"
				onClick={togglePopover}
			>
				i
			</button>

			{isVisible && (
				<div
					id={popoverId}
					role="tooltip"
					className="absolute z-10 visible inline-block w-64 text-sm light:text-gray-500 transition-opacity duration-300 light:bg-white border light:border-gray-200 rounded-lg shadow-sm opacity-100 text-white border-gray-600 bg-gray-800"
				>
					<div className="py-1 px-2 light:bg-gray-100 border-b light:border-gray-200 rounded-t-lg border-gray-600 bg-slate-800">
						<h3 className="font-semibold light:text-gray-900 text-white">
							{title || "Info"}
						</h3>
					</div>
					<div className="py-1 px-2">
						<p>{text}</p>
					</div>
					<div data-popper-arrow />
				</div>
			)}
		</>
	);
};

export default InfoTextReact;
