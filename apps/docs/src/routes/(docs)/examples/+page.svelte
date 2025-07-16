<script lang="ts">
    import ExampleCard from "$lib/components/example-card.svelte";
    import { examples } from "$lib/examples";
    import { snakeToTitleCase } from "$lib/utils";
    import { Callout, Card, CardGrid } from "@svecodocs/kit";
</script>

<main class="flex flex-col h-full">
    <div class="flex flex-col m-8 gap-2">
        <h1 class="text-5xl font-semibold">Examples</h1>
        <p class="text-lg">
            Explore practical examples demonstrating Mercury's capabilities.
        </p>
        <p class="">
            These examples illustrate the versatile animations achievable with
            Mercury. Many are adapted from Matt Perry’s Motion library,
            showcasing Mercury’s compatibility with reliable, battle-tested
            animations.
        </p>
        <Callout type="tip" title="Important Note">
            While the animations have been adapted to Svelte with Mercury, only
            examples from Motion’s free tier have the source code here to
            respect their premium content. For access to exclusive animations
            and source code, consider subscribing to Motion+. You are encouraged
            to subscribe and replicate their advanced examples in Svelte using
            Mercury for practice. Subscribe at Motion.
        </Callout>
        <CardGrid cols={4}>
            {#each Object.entries(examples) as [key, example] (key)}
                {@const ExampleComponent = example.component}
                <ExampleCard
                    title={snakeToTitleCase(key)}
                    href="/examples/{key}"
                >
                    <ExampleComponent />
                </ExampleCard>
            {/each}
        </CardGrid>
    </div>
</main>
