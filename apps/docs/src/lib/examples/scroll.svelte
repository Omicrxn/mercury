<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	import ArrowDown from 'phosphor-svelte/lib/ArrowDown'
</script>

<div class="scroll-test flex flex-col gap-4 h-full w-full flex-1 overflow-auto p-4">
    <div class="h-[100dvh] w-full flex flex-col items-center justify-start gap-2 text-2xl font-bold">Scroll down to see the effect
    <ArrowDown {@attach mercury({animate:{y:10}, transition:{type:'spring',duration:0.1, repeat:Infinity, repeatType: 'reverse'}})} size={32}/>
    </div>
	<div
		class="opacity-0 box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		{@attach mercury({
			scroll: {
				enter: { opacity: 1, x: 150, rotate: 180 },
				exit: { opacity: 0, x: 0, rotate: 0 },
				transition: { duration: 1 },
				root: document.querySelector('.scroll-test')
			},
			transition: { ease: 'circInOut', duration: 1 }
		})}
	></div>
</div>
