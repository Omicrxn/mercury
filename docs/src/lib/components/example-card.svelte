<script lang="ts">
    let {title,href, children } = $props();
</script>

    <a href={href}  class="dark:bg-primary bg-background dark:ring-primary-hover dark:inset-shadow-muted/20 dark:inset-ring-muted/10 inset-ring-muted/20 ring-muted inset-shadow-muted/20 dark:hover:ring-muted-foreground/50 hover:ring-muted-foreground group/card inset-ring inset-shadow-sm relative flex flex-col items-center gap-6 max-w-[760px] rounded-xl px-6 py-5 ring transition-all mb-0 mt-0">
        <h2 class="text-xl font-semibold">{title}</h2>
        <div class="flex justify-center items-center flex-col w-full  flex-1 gap-8">
            {@render children?.()}
        </div>

    </a>
