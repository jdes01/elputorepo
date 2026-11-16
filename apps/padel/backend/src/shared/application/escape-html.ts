const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Lo que va dentro de un HTML y no lo escribimos nosotros (el nombre de un club,
// por ejemplo) se escapa: "<b>" se ve como "<b>", no como negrita.
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ENTITIES[char]!);
}
