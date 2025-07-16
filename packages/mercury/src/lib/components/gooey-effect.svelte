<script lang="ts">
	let { id = 'gooey-filter', strength = 10 }: { id?: string; strength?: number } = $props();
</script>

<svg class="hidden absolute">
	<defs>
		<filter {id}>
			<feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur-sm" />
			<feColorMatrix
				in="blur-sm"
				type="matrix"
				values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 17 -7"
				result="goo"
			/>
			<feComposite in="SourceGraphic" in2="goo" operator="atop" />
		</filter>
	</defs>
</svg>
