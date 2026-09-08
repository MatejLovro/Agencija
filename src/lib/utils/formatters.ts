export function capitalizeWords(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function capitalizeIbanPrefix(value: string): string {
  return value.slice(0, 2).toUpperCase() + value.slice(2);
}
