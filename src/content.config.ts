import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
            author: z.string().optional(),
            pinned: z.boolean().optional(),
            tags: z.array(z.string()).optional(),
            license: z.string().default("NONE"),
		}),
});

const announce = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.string(),
        pinned: z.boolean().optional(),
        description: z.string().optional(),
    }),
});

export const collections = { blog, announce, };
