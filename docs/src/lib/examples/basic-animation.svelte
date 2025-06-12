<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex flex-col gap-4 justify-center items-center w-full h-full">
	<div
		class="box w-16 h-16 dark:bg-blue-500 bg-blue-300 rounded-md border-2 dark:border-slate-50 border-slate-600"
		style="transform: scale(0.4);"
		{@attach mercury({
			animate: { scale: 1 },
			transition: { ease: 'circInOut', duration: 1, autoplay: true }
		})}
	></div>
</div>
