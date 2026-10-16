// Tiny DOM helpers shared by effect modules.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const img = (name) => import.meta.env.BASE_URL + 'img/' + name;
