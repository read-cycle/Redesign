declare module 'BookMappings' {
  export const isbnToTitle: Record<string, string>;
  export const titleToIsbn: Record<string, string>;
  export const isbnToSubject: Record<string, string>;
  export const titleToSubject: Record<string, string>;
  export const isbnToGrade: Record<string, string>;
  export const titleToGrade: Record<string, string>;
}