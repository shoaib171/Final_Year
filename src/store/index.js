import { proxy } from 'valtio';

const state = proxy({
	intro: true,
	color: '#EFBD48',
	isLogoTexture: true,
	isFullTexture: false,
	isDownloaded: true,
	logoDecal: './icon.png',
	fullDecal: './Logo.png',
});
export default state;
