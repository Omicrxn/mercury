<script lang="ts">
	import { mercury, GooeyEffect } from '@omicrxn/mercury';
	let show = $state(false);
	const id = $props.id();
</script>

<div class="relative w-full min-h-72 flex flex-col justify-end items-start p-8">
	<GooeyEffect id={`${id}-gooey`} strength={10} />

	<div class="relative w-48 h-52" style:filter={`url(#${id}-gooey)`}>
		<div
			style="transform:translateY(80px);"
			class="gooey-blob absolute bottom-20 left-0 rounded-full size-12 bg-foreground"
			{@attach mercury({
				animate: { y: show ? 0 : 80 },
				initial: false,
				transition: { duration: 0.3, delay: show ? 0 : 0.1, ease: 'easeInOut' }
			})}
		>
			<div
				style="transform:translateY(-80px);"
				id={`${id}-details`}
				aria-hidden={!show}
				inert={!show}
				class="gooey-panel opacity-0 w-48 h-32 min-w-16 min-h-16 bg-foreground text-background rounded-md p-4"
				{@attach mercury({
					animate: { opacity: show ? 1 : 0 },
					initial: false,
					transition: { duration: show ? 0.5 : 0.3, delay: show ? 0.2 : 0, ease: 'easeOut' }
				})}
			>
				<div
					style="transform:translateY(20px);"
					class="grid grid-cols-2 grid-rows-3 gap-3 justify-items-stretch"
					{@attach mercury({
						animate: { y: show ? 0 : 20 },
						initial: false,
						transition: { duration: show ? 0.5 : 0.3, delay: show ? 0.2 : 0, ease: 'easeOut' }
					})}
				>
					<div class="text-background/60 text-sm">Next.js</div>
					<div class="text-background/60 text-sm text-end">v13.4.8</div>
					<div>Errors</div>
					<div class="flex justify-end">
						<div class="bg-red-500/25 text-red-500 rounded-full size-6 flex place-content-center">
							3
						</div>
					</div>
					<div>Route</div>
					<div class="text-end text-background/80">Static</div>
				</div>
			</div>
		</div>

		<button
			type="button"
			aria-label="Toggle route details"
			aria-expanded={show}
			aria-controls={`${id}-details`}
			class="absolute bottom-0 left-0 rounded-full bg-foreground text-foreground size-12 z-10 flex place-items-center p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-demo-accent"
			onclick={() => (show = !show)}
			{@attach mercury({
				whileTap: { scale: 0.9, transition: { duration: 0.2, type: 'spring' } }
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
					<circle cx="90" cy="90" r="87" fill="currentColor" stroke-width="6" />
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
						class="text-background"
					>
						<stop stop-color="currentColor" />
						<stop offset="1" stop-color="currentColor" stop-opacity="0" />
					</linearGradient>
					<linearGradient
						id="paint1_linear_408_139"
						x1="121"
						y1="54"
						x2="120.799"
						y2="106.875"
						gradientUnits="userSpaceOnUse"
						class="text-background"
					>
						<stop stop-color="currentColor" />
						<stop offset="1" stop-color="currentColor" stop-opacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</button>
	</div>
</div>
