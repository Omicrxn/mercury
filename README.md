# Mercury

Mercury is a powerful animation library for Svelte, designed to provide a seamless and intuitive animation experience with a syntax that feels natural to Svelte developers.

## Features

- **Svelte-native syntax**: Use Mercury through a Svelte action, allowing you to animate components without wrapper elements.
- **Full HTML/Svelte component compatibility**: Benefit from all features of standard HTML tags and Svelte components without API limitations.
- **Powered by Anime.js**: Leverages the robust Anime.js library as its animation core.
- **Layout animations**: Smooth transitions for layout changes (coming soon).
- **Expanded feature set**: Additional animation capabilities beyond basic Anime.js functionality.

## Installation
(npm package comming soon)

## Usage

Here's a basic example of how to use Mercury in your Svelte component:

```svelte
<script>
  import { mercury, useExit } from 'mercury';

  let show = $state(false);
</script>

<button onclick={() => show = !show}>Toggle Show</button>

{#if show}
  <div
    class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
    use:mercury={{
      opacity: 1,
      scale: [1, 2, 2, 1, 1],
      rotate: [0, 0, 180, 180, 0],
      borderRadius: ['8%', '8%', '50%', '50%', '8%'],
      duration: 3,
      ease: 'inOutSine',
      delay: 0.5,
      loop: true
    }}
    out:useExit={{
      opacity: 0,
      scale: 0,
      duration: 1
    }}
  />
{/if}
```

## Why Mercury?

Mercury brings the power of advanced animation libraries like Framer Motion to Svelte, but with a twist. Instead of wrapping your components, Mercury uses Svelte actions. This approach allows you to:

1. Keep your markup clean and semantic
2. Utilize all native HTML attributes and Svelte component props without restrictions
3. Enjoy a more Svelte-like development experience

## Documentation

(Coming soon) Comprehensive documentation covering all features, options, and advanced usage scenarios.

## Contributing

We welcome contributions! More details on this soon.

## License

Mercury is [MIT licensed](LICENSE).

## Acknowledgements

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of Svelte, Anime.js, and all the other open-source projects that make this possible.
