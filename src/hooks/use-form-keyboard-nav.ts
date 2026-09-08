"use client";

import { useCallback, type KeyboardEvent } from "react";

/**
 * Elementi/widgeti koji imaju vlastitu Enter semantiku (Radix Select,
 * cmdk Command list, native <select>, menu, listbox...). Enter unutar
 * njih se ne smije presresti — ostavljamo native/Radix ponašanje.
 *
 * `data-kbnav-ignore` je primarni escape hatch za bilo koju drugu
 * kompleksnu komponentu koja treba zadržati svoje Enter ponašanje.
 */
const IGNORE_SELECTOR = [
  "[data-kbnav-ignore]",
  "[cmdk-root]",
  "[cmdk-input]",
  "select",
  '[role="listbox"]',
  '[role="option"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="combobox"]',
].join(",");

const FOCUSABLE_SELECTOR = [
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "button",
  "[data-kbnav-stop]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function isVisible(el: HTMLElement) {
  return el.offsetParent !== null || el === document.activeElement;
}

function isFocusable(el: HTMLElement) {
  if (el.hasAttribute("disabled")) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  if (!isVisible(el)) return false;
  return true;
}

/**
 * Vraća listu elemenata koji su validne "stanice" za Enter navigaciju:
 * standardni polja za unos (input/select/textarea) plus elementi
 * eksplicitno označeni s `data-kbnav-stop` (npr. Combobox/DatePicker
 * trigger, ili submit gumb). Obični pomoćni gumbi (Odustani, Dodaj,
 * ikone) namjerno nisu uključeni osim ako nose `data-kbnav-stop`.
 */
function getNavItems(form: HTMLFormElement): HTMLElement[] {
  const all = Array.from(
    form.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return all.filter((el) => {
    if (!isFocusable(el)) return false;
    if (el.tagName === "BUTTON") {
      const role = el.getAttribute("role");
      // Radix Checkbox/RadioGroupItem su <button role="checkbox"/"radio">
      // bez eksplicitnog type atributa (property .type tada defaultira na
      // "submit" po HTML spec-u) — moraju biti isključeni iz Enter navigacije,
      // to su toggle kontrole, ne sekvencijalna polja za unos.
      if (role === "checkbox" || role === "radio") return false;
      // Koristi type ATRIBUT (ne .type property) da izbjegnemo lažni
      // "submit" default za buttone kojima type nije eksplicitno postavljen.
      const typeAttr = el.getAttribute("type");
      // Uključi samo eksplicitno submit gumb (ili elemente označene kao stop)
      return typeAttr === "submit" || el.hasAttribute("data-kbnav-stop");
    }
    return true;
  });
}

export function useFormKeyboardNav() {
  return useCallback((e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;

    if (target.closest(IGNORE_SELECTOR)) return;

    const form = e.currentTarget;

    // Submit gumb: Enter ovdje mora izvršiti native submit.
    if (
      target.tagName === "BUTTON" &&
      target.getAttribute("type") === "submit"
    ) {
      return;
    }

    if (target.tagName === "TEXTAREA") {
      if (e.ctrlKey || e.shiftKey) {
        // Novi red — pusti default, ne diraj fokus.
        return;
      }
      e.preventDefault();
    } else if (target.tagName === "INPUT") {
      e.preventDefault();
    } else {
      return;
    }

    const items = getNavItems(form);
    const currentIndex = items.indexOf(target);
    if (currentIndex === -1) return;

    const next = items[currentIndex + 1];
    if (next) {
      next.focus();
      if (next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement) {
        next.select?.();
      }
    }
  }, []);
}
