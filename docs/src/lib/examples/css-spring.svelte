<script lang="ts">
    import { spring } from "motion";
    let value = $state(true);
    const springAnimation = spring(0.5, 0.8);
</script>

<div class="flex flex-col gap-6 items-center">
    <div
        data-state={value}
        class="box"
        style="transition: transform {springAnimation};"
    ></div>
    <button
        class="dark:bg-indigo-400 bg-indigo-200 dark:border-slate-50 border-slate-500 dark:hover:bg-indigo-500 hover:bg-indigo-300 cursor-pointer px-2 py-1 rounded-md"
        onclick={() => (value = !value)}>Toggle position</button
    >
</div>

<style>
    .box {
        transform: translateX(-100%);
    }

    .box[data-state="true"] {
        transform: translateX(100%) rotate(180deg);
    }
</style>
