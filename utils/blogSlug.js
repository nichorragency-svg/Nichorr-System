function slugify(title) {
    return String(title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'post';
}

async function uniqueSlug(Blog, baseSlug) {
    let slug = baseSlug;
    let n = 0;
    while (await Blog.findOne({ slug })) {
        n += 1;
        slug = `${baseSlug}-${n}`;
    }
    return slug;
}

module.exports = { slugify, uniqueSlug };
