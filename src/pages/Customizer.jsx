import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import config from '../config/config';
import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { AiPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components';

const Customizer = () => {
	const snap = useSnapshot(state);

	const [file, setFile] = useState('');

	const [prompt, setPrompt] = useState('');
	const [generatingImg, setGeneratingImg] = useState(false);

	const [activeEditorTab, setActiveEditorTab] = useState(false);
	const [activeFilterTab, setActiveFilterTab] = useState({
		logoShirt: true,
		stylishShirt: false,
	});

	// show tab content depending on the activeTab
	const generateTabContent = () => {
		switch (activeEditorTab) {
			case 'colorpicker':
				return <ColorPicker />;
			case 'filepicker':
				return (
					<FilePicker
						file={file}
						setFile={setFile}
						readFile={readFile}
					/>
				);
			case 'aipicker':
				return (
					<AiPicker
						prompt={prompt}
						setPrompt={setPrompt}
						generatingImg={generatingImg}
						handleSubmit={handleSubmit}
					/>
				);
			default:
				return null;
		}
	};

	// const handleSubmit = async (type, handleError) => {
	// 	if (!prompt) return alert('Please enter a prompt');

	// 	try {
	// 		const response = await fetch('http://localhost:8080/api/v1/dalle', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 			body: JSON.stringify({
	// 				prompt,
	// 			}),
	// 		});

	// 		if (!response.ok) {
	// 			throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
	// 		}

	// 		const data = await response.json();
	// 		if (data.error && data.error.code === 'billing_hard_limit_reached') {
	// 			handleError('Billing hard limit reached. Please upgrade your plan or contact support.');
	// 		} else {
	// 			handleDecals(type, `data:image/png;base64,${data.photo}`);
	// 		}
	// 	} catch (error) {
	// 		console.error('Fetch error:', error.message);
	// 		handleError('Error communicating with the server');
	// 	} finally {
	// 		setGeneratingImg(false);
	// 		setActiveEditorTab('');
	// 	}
	// };

	const handleSubmit = async (type) => {
		if (!prompt) return alert('Please enter a prompt');

		try {
			setGeneratingImg(true);

			const response = await fetch('http://localhost:8080/api/v1/dalle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt,
				}),
			});
			if (!response.ok) {
				throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.error && data.error.code === 'billing_hard_limit_reached') {
				handleError('Billing hard limit reached. Please upgrade your plan or contact support.');
			} else {
				handleDecals(type, `data:image/png;base64,${data.photo}`);
			}
		} catch (error) {
			console.error('Fetch error:', error.message);
		} finally {
			setGeneratingImg(false);
			setActiveEditorTab('');
		}
	};

	const handleDecals = (type, result) => {
		const decalType = DecalTypes[type];

		state[decalType.stateProperty] = result;

		if (!activeFilterTab[decalType.filterTab]) {
			handleActiveFilterTab(decalType.filterTab);
		}
	};

	// const downloadShirt = () => {
	// 	const canvas = document.querySelector('canvas'); // Assuming there is only one canvas in your application
	// 	const shirtDataURL = canvas.toDataURL('image/png');

	// 	const link = document.createElement('a');
	// 	link.href = shirtDataURL;
	// 	link.download = 'shirt.png';
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// };

	const handleActiveFilterTab = (tabName) => {
		switch (tabName) {
			case 'logoShirt':
				state.isLogoTexture = !activeFilterTab[tabName];
				break;
			case 'stylishShirt':
				state.isFullTexture = !activeFilterTab[tabName];
				break;
			case 'downLoadShirt':
				state.isDownloaded = !activeFilterTab[tabName];
				if (!activeFilterTab[tabName]) {
					downloadCanvasToImage();
				}
				break;
			default:
				state.isLogoTexture = true;
				state.isFullTexture = false;
				break;
		}

		// after setting the state, activeFilterTab is updated
		setActiveFilterTab((prevState) => {
			return {
				...prevState,
				[tabName]: !prevState[tabName],
			};
		});
	};

	const readFile = (type) => {
		reader(file).then((result) => {
			handleDecals(type, result);
			setActiveEditorTab('');
		});
	};

	return (
		<AnimatePresence>
			{!snap.intro && (
				<>
					<motion.div
						key="custom"
						className="absolute top-0 left-0 z-10"
						{...slideAnimation('left')}>
						<div className="flex items-center min-h-screen">
							<div className="editortabs-container tabs">
								{EditorTabs.map((tab) => (
									<Tab
										key={tab.name}
										tab={tab}
										handleClick={() => setActiveEditorTab(tab.name)}
									/>
								))}

								{generateTabContent()}
							</div>
						</div>
					</motion.div>

					<motion.div
						className="absolute z-10 top-5 right-5"
						{...fadeAnimation}>
						<CustomButton
							type="filled"
							title="Go Back"
							handleClick={() => (state.intro = true)}
							customStyles="w-fit px-4 py-2.5 font-bold text-sm"
						/>
					</motion.div>

					<motion.div
						className="filtertabs-container"
						{...slideAnimation('up')}>
						{FilterTabs.map((tab) => (
							<Tab
								key={tab.name}
								tab={tab}
								isFilterTab
								isActiveTab={activeFilterTab[tab.name]}
								handleClick={() => handleActiveFilterTab(tab.name)}
							/>
						))}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default Customizer;
