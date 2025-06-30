import { examples } from '$lib/examples';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;
    
    // Check if example exists
    if (!examples[slug]) {
        throw error(404, 'Example not found');
    }
    
    // Try to load source code
    let source = null;
    try {
        const module = await import(`../../../lib/examples/${slug}.svelte?raw`);
        source = module.default;
    } catch (err) {
        console.error('Failed to load source:', err);
        // Don't throw error, just set source to null
    }
    
    return {
        slug,
        example: examples[slug],
        source
    };
}