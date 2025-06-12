<script lang="ts">
    import { page } from "$app/state";
    import BasicAnimation from "$lib/examples/basic-animation.svelte";
    import Code from "phosphor-svelte/lib/Code";
    import ArrowClockwise from "phosphor-svelte/lib/ArrowClockwise";
    import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
    import { Button, code } from "@svecodocs/kit";
    import { examples } from "$lib/examples";

    let {
        params: { slug },
    } = page;
</script>

<div class="flex flex-col h-full w-full place-content-center px-8">
    <div class="flex justify-between">
        <div>
            <Button size="icon" href="/examples"><ArrowLeft /></Button>
        </div>
        <div class="flex gap-2">
            <Button><Code /> Show Code</Button>
            <Button size="icon"><ArrowClockwise /></Button>
        </div>
    </div>
    {#if slug}
        {@const Example = examples[slug]}
        <div class="h-full w-full flex flex-col items-center justify-center">
            <Example />
        </div>
    {/if}
</div>
