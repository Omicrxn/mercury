<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">SVG Loading Spinner</h2>
	<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
		<g class="segment" opacity="0">
			<path
				id="loading-path"
				d="M 94 25 C 94 21.686 96.686 19 100 19 L 100 19 C 103.314 19 106 21.686 106 25 L 106 50 C 106 53.314 103.314 56 100 56 L 100 56 C 96.686 56 94 53.314 94 50 Z"
			></path>
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(45deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(90deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(135deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(180deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(225deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(270deg)" />
		</g>
		<g class="segment" opacity="0">
			<use href="#loading-path" style="transform: rotate(315deg)" />
		</g>
	</svg>
</div>
