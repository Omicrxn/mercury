<script lang="ts">
	import { mercury, useExit } from '$lib/index.js';

	let justify = $state('justify-start');
	let show = $state(true);
</script>

<div class="relative flex flex-col h-full items-center gap-12 p-32 bg-blue-500">
	<div class="flex justify-center gap-4">
		<button
			onclick={() => {
				justify = 'justify-start';
			}}>Justify Start</button
		>
		<button
			onclick={() => {
				justify = 'justify-center';
			}}>Justify Center</button
		>
		<button
			onclick={() => {
				justify = 'justify-end';
			}}>Justify End</button
		>
		<button
			onclick={() => {
				show = !show;
			}}>Toggle show</button
		>
	</div>
	<div class="flex w-full flex-col gap-3">
		<!-- <div id="flexWrapper" class="flex gap-2 min-h-16 w-full p-4 items-center bg-gray-200 {justify}">
			<div
				id="box"
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
			>
				<p id="text">Projection</p>
			</div>
			{#if show}
				<div
					id="box-two"
					class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
					style={justify === 'justify-end'
						? 'width:200px;height:200px;'
						: 'width:96px;height:96px;'}
				>
					<p id="text-2">Projection</p>
				</div>
			{/if}

			<div
				id="box-three"
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
			>
				<div class="flex flex-col">
					<p id="text-three">Projection</p>
					<p id="text-three">Projection</p>
				</div>
			</div>
		</div> -->
		<div id="flexWrapper" class="flex gap-2 min-h-16 w-full p-4 items-center bg-gray-200 {justify}">
			<div
				id="box"
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
				use:mercury={() => ({})}
				out:useExit
				layout
			>
				<p id="text">Projection</p>
			</div>
			{#if show}
				<div
					id="box-two"
					class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
					style={justify === 'justify-end'
						? 'width:200px;height:200px;'
						: 'width:96px;height:96px;'}
					use:mercury
					out:useExit={{ opacity: 0, scale: 0.5, rotate: 90 }}
					layout
				>
					<p id="text-2">Projection</p>
				</div>
			{/if}

			<div
				id="box-three"
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
				use:mercury={() => ({})}
				out:useExit
				layout
			>
				<div class="flex flex-col">
					<p id="text-three">Projection</p>
					<p id="text-three">Projection</p>
				</div>
			</div>
		</div>
	</div>
</div>
