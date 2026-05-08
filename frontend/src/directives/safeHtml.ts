import DOMPurify from 'dompurify'
import type { Directive, DirectiveBinding } from 'vue'

const PURIFY_CONFIG = {
    ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code',
        'pre', 'span', 'div', 'mark', 'del', 'sup', 'sub',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'id', 'style',
        'mark', 'data-*',
    ],
    ALLOW_DATA_ATTR: true,
}

export const vSafeHtml: Directive<HTMLElement> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
        updateContent(el, binding.value)
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string>) {
        updateContent(el, binding.value)
    },
}

function updateContent(el: HTMLElement, value: string) {
    if (value) {
        el.innerHTML = DOMPurify.sanitize(value, PURIFY_CONFIG)
    } else {
        el.innerHTML = ''
    }
}
