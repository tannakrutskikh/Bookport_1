function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[,“\"\'\.\!\?\-]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

export function getRecipeImagePath(emotionalName?: string, technicalName?: string): string | null {
  const name = emotionalName || technicalName;
  if (!name) return null;
  const norm = normalize(name);
  return `/images/recipes/${norm}.webp`;
}

export function hasRecipeImage(emotionalName?: string, technicalName?: string): boolean {
  const name = emotionalName || technicalName;
  return !!name && normalize(name).length > 0;
}
