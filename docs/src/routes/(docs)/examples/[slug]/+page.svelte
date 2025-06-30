<script lang="ts">
    import { page } from "$app/state";
    import Code from "phosphor-svelte/lib/Code";
    import Lock from "phosphor-svelte/lib/Lock";
    import ArrowClockwise from "phosphor-svelte/lib/ArrowClockwise";
    import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
    import { Button, code } from "@svecodocs/kit";
    import type { AnimationInstance } from "@omicrxn/mercury";
    import { onMount } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { pre as Pre, code as SvedocsCode } from "@svecodocs/kit";
    import { codeToHtml } from "shiki";
    import * as CodeComponent from "$lib/components/ui/code";

    let { data } = $props();
    let { slug, example, source: initialSource } = data;

    let {
        url: { searchParams },
    } = page;

    let animation = $state<AnimationInstance>();
    let source = $state(initialSource);
    let isEmbedded = $derived(searchParams.get("utm_source") === "embed");
    let isPremium = $derived(example?.isPremium ?? false);
</script>

<div
    class={[
        "flex flex-col h-full w-full place-content-center px-8 relative",
        isEmbedded &&
            "fixed! w-full h-full top-0 left-0 right-0 bottom-0 z-10 bg-background-secondary p-3!",
    ]}
>
    <div class="flex justify-between">
        <div>
            <Button size="icon" href="/examples"><ArrowLeft /></Button>
        </div>

        <div class="flex gap-2">
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button>
                        {#if isPremium}
                            <Lock />
                        {:else}
                            <Code />
                        {/if} Show Code</Button
                    >
                </Dialog.Trigger>
                <Dialog.Content class="max-h-[80dvh] flex flex-col">
                    <Dialog.Header class="shrink-0">
                        <Dialog.Title>
                            <span class="inline-flex gap-2 items-center">
                                <Code />Source Code
                            </span>
                        </Dialog.Title>
                    </Dialog.Header>
                    <div class="flex-1 min-h-0 overflow-auto">
                        {#if isPremium}
                            <div class="code-container">
                                This example is part of the premium content on
                                the original creator's site. Out of respect for
                                their work, we're not sharing the source code
                                here—but we've recreated it with Mercury to
                                demonstrate what's possible. If you like it,
                                consider supporting the author by subscribing to
                                their website.
                            </div>
                        {:else if source}
                            <CodeComponent.Root
                                lang="svelte"
                                class="w-full"
                                code={source}
                            >
                                <CodeComponent.CopyButton />
                            </CodeComponent.Root>
                        {/if}
                    </div>
                </Dialog.Content>
            </Dialog.Root>

            {#if animation}
                <Button
                    size="icon"
                    onclick={() => {
                        if (animation) {
                            animation.play();
                        }
                    }}
                >
                    <ArrowClockwise />
                </Button>
            {/if}
        </div>
    </div>
    {#if slug}
        {@const Example = example.component}
        <div class="h-full w-full flex flex-col items-center justify-center">
            <Example bind:animation />
        </div>
    {/if}
</div>

<style>
    .code-container {
        max-height: 60vh;
        overflow: auto;
        border-radius: 0.375rem;
    }

    .code-container :global(pre) {
        margin: 0;
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        word-wrap: normal;
        max-width: 100%;
    }

    .code-container :global(code) {
        display: block;
        width: 100%;
    }
</style>
