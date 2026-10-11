export const translateClient=(text:string):string=> {
  const translate=(globalThis as typeof globalThis & {dieTranslate?: (value:string)=>string}).dieTranslate;
  return translate?translate(text):text;
};
