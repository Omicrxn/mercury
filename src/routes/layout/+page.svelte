<script lang="ts">
	import { mercury, animateExit } from '$lib/index.js';
	import { ElementRect } from 'runed';
	let justify = $state('justify-start');
	let show = $state(true);
	let box = $state<HTMLElement>();
	const rect = new ElementRect(() => box);
	$inspect(rect.current);
	function logBoxRect() {
		console.log(rect.current);
	}
</script>

<div class="relative flex flex-col h-full items-center gap-12 p-32 bg-blue-500">
	<div class="flex justify-center gap-4">
		<button onclick={logBoxRect}>Log Box Rect</button>
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
		<div
			id="flexWrapper"
			class="flex gap-2 min-h-16 w-full p-4 items-center bg-gray-200 {justify}"
			use:mercury
			layout
		>
			<div
				id="box"
				bind:this={box}
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				use:mercury
				layout
			>
				<!-- <p id="text" use:layoutAction layout>Projection</p> -->
			</div>
			<!-- {#if show}
				<div
					id="box-two"
					class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
					style={justify === 'justify-end'
						? 'width:200px;height:200px;'
						: 'width:96px;height:96px;'}
					use:mercury
					out:animateExit={{ opacity: 0, scale: 0.5, rotate: 90 }}
					layout
				>
					<p id="text-2" use:mercury layout>Projection</p>
				</div>
			{/if}

			<div
				id="box-three"
				class="w-24 h-24 rounded-lg bg-blue-400 border items-center justify-center flex border-blue-600"
				style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
				use:mercury
				out:animateExit
				layout
			>
				<div class="flex flex-col" use:mercury layout>
					<p id="text-three" use:mercury layout>Projection</p>
					<p id="text-three" use:mercury layout>Projection</p>
				</div>
			</div> -->
		</div>
	</div>
</div>
