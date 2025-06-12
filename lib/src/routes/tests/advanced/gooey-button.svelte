<script lang="ts">
	import { mercury, layout, presence } from '$lib/index.js';
	let show = $state(false);
</script>

{#snippet gooeyEffect()}
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
		<defs>
			<filter id="goo">
				<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
				<feColorMatrix
					in="blur"
					type="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
					result="goo"
				/>
				<feComposite in="SourceGraphic" in2="goo" operator="atop" />
			</filter>
		</defs>
	</svg>
{/snippet}
{@render gooeyEffect()}

<div class="flex h-dvh flex-col gap-8 place-content-end" style:filter={'url(#goo)'}>
	{#if show}
		<div
			style="transform:translateY(78px);"
			class="rounded-full size-12 bg-black"
			{@attach mercury({
				animate: { y: 0 },
				transition: { duration: 0.3, ease: 'easeInOut' }
			})}
			out:presence={{ y: 78, transition: { delay: 0.1, duration: 0.3, ease: 'easeOut' } }}
		>
			<div
				style="transform:translateY(-78px);"
				class="opacity-0 w-48 h-32 min-w-16 min-h-16 bg-black text-white rounded-md p-4"
				{@attach mercury({
					animate: { opacity: 1 },
					transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' }
				})}
				out:presence={{ opacity: 0, blur: 4, transition: { duration: 0.3, ease: 'easeOut' } }}
			>
				<div
					style="transform:translateY(20px);"
					class="grid grid-cols-2 grid-rows-3 gap-3 justify-items-stretch"
					{@attach mercury({
						animate: { y: 0 },
						transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' }
					})}
					out:presence={{ y: 20, opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
				>
					<div class="text-slate-400 text-sm">Next.js</div>
					<div class="text-slate-400 text-sm text-end">v13.4.8</div>
					<div>Errors</div>
					<div class="flex justify-end">
						<div class="bg-red-900 text-red-400 rounded-full size-6 flex place-content-center">
							3
						</div>
					</div>
					<div>Route</div>
					<div class="text-end text-slate-300">Static</div>
				</div>
			</div>
		</div>
	{/if}

	<div
		class="rounded-full bg-black size-12 z-10 flex place-items-center p-1 cursor-pointer"
		onclick={() => (show = !show)}
		{@attach mercury({
			whileTap: { scale: 0.6 },
			transition: { duration: 0.2, type: 'spring' }
		})}
	>
		<svg
			width="60"
			height="60"
			viewBox="0 0 180 180"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<mask
				id="mask0_408_139"
				style="mask-type:alpha"
				maskUnits="userSpaceOnUse"
				x="0"
				y="0"
				width="180"
				height="180"
			>
				<circle cx="90" cy="90" r="90" fill="black" />
			</mask>
			<g mask="url(#mask0_408_139)">
				<circle cx="90" cy="90" r="87" fill="black" stroke-width="6" />
				<path
					d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
					fill="url(#paint0_linear_408_139)"
				/>
				<rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_139)" />
			</g>
			<defs>
				<linearGradient
					id="paint0_linear_408_139"
					x1="109"
					y1="116.5"
					x2="144.5"
					y2="160.5"
					gradientUnits="userSpaceOnUse"
				>
					<stop stop-color="white" />
					<stop offset="1" stop-color="white" stop-opacity="0" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_408_139"
					x1="121"
					y1="54"
					x2="120.799"
					y2="106.875"
					gradientUnits="userSpaceOnUse"
				>
					<stop stop-color="white" />
					<stop offset="1" stop-color="white" stop-opacity="0" />
				</linearGradient>
			</defs>
		</svg>
	</div>
</div>
