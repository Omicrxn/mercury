<script lang="ts">
	let { id = 'gooey-filter', strength = 10 }: { id?: string; strength?: number } = $props();
</script>

<!--
	Zero-size rather than display:none: some browsers ignore filters defined inside an
	undisplayed SVG. Inline styles, so the definition stays hidden without Tailwind.
-->
<svg
	aria-hidden="true"
	width="0"
	height="0"
	style="position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none;"
>
	<defs>
		<filter {id}>
			<feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
			<feColorMatrix
				in="blur"
				type="matrix"
				values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 17 -7"
				result="goo"
			/>
			<feComposite in="SourceGraphic" in2="goo" operator="atop" />
		</filter>
	</defs>
</svg>
