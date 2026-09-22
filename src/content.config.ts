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
            zh: z.boolean().default(false),
            tags: z.array(z.string()).optional(),
            license: z.string().default("NONE"),
		}),
});

const announce = defineCollection({
    loader: glob({ base: './src/content/announce', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        pinned: z.boolean().optional(),
        description: z.string().optional(),
    }),
});

const friendlinks = defineCollection({
    loader: glob({ base: './src/content/friendlinks', pattern: '**/*.md' }),
    schema: z.object({
        name: z.string(),
        url: z.string().url(),
        avatar: z.string(),
        description: z.string().optional(),
    }),
});

const about = defineCollection({
  loader: glob({ base: './src/content/about', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { blog, announce, friendlinks, about, };
