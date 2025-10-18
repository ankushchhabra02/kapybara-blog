import slugify from "slugify";
export const makeSlug = (text: string) => slugify(text, { lower: true });
