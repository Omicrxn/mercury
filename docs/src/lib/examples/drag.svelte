<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex flex-col gap-4">
	<div
		{@attach mercury({ drag: true })}
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
	></div>
</div>
