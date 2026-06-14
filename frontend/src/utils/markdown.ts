export function stripMarkdown(md: string): string {
  if (!md) return '';
  
  return md
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove headers
    .replace(/#{1,6}\s?/g, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove blockquotes
    .replace(/>\s?/g, '')
    // Remove code blocks
    .replace(/```.*?```/gs, '')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove horizontal rules
    .replace(/---|\*\*\*/g, '')
    // Replace multiple newlines with single space
    .replace(/\n+/g, ' ')
    .trim();
}
