import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { phraseDictionary, singleWordDictionary } from '@/i18n/phraseDictionary';

const originalTextMap = new WeakMap<Node, string>();

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const allDictionaryKeys = Object.keys(phraseDictionary).sort((a, b) => b.length - a.length);
const allWordKeys = Object.keys(singleWordDictionary).sort((a, b) => b.length - a.length);

// Bidirectional Reverse Lookup: Hindi/Telugu -> English
const reverseDictionary: Record<string, string> = {};

for (const [enKey, translations] of Object.entries(phraseDictionary)) {
  if (translations.hi) {
    reverseDictionary[translations.hi.trim().toLowerCase()] = enKey;
  }
  if (translations.te) {
    reverseDictionary[translations.te.trim().toLowerCase()] = enKey;
  }
}

for (const [enKey, translations] of Object.entries(singleWordDictionary)) {
  if (translations.hi) {
    reverseDictionary[translations.hi.trim().toLowerCase()] = enKey;
  }
  if (translations.te) {
    reverseDictionary[translations.te.trim().toLowerCase()] = enKey;
  }
}

const allReverseKeys = Object.keys(reverseDictionary).sort((a, b) => b.length - a.length);

const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

export const GlobalDOMTranslator: React.FC = () => {
  const { language } = useLanguage();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIndic = (text: string) => /[\u0900-\u097F\u0C00-\u0C7F]/.test(text);

    const translateNodeToIndic = (node: Node, lang: 'hi' | 'te') => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node.nodeValue;
      if (!text || text.trim().length <= 1) return;
      if (/^[\d\s.,:%()#+-]+$/.test(text.trim())) return;

      const parent = node.parentElement;
      if (!parent) return;
      const tagName = parent.tagName.toLowerCase();
      if (['script', 'style', 'code', 'pre', 'textarea', 'input'].includes(tagName)) return;
      if (parent.isContentEditable) return;

      if (!originalTextMap.has(node) && !isIndic(text)) {
        originalTextMap.set(node, text);
      }

      const original = (originalTextMap.has(node) && !isIndic(originalTextMap.get(node)!))
        ? originalTextMap.get(node)!
        : text;

      const cleanOriginal = original.trim().toLowerCase();
      const leadingWhitespace = original.match(/^\s*/)?.[0] || '';
      const trailingWhitespace = original.match(/\s*$/)?.[0] || '';
      const trimmed = original.trim();

      const leadingPunctMatch = trimmed.match(/^[^a-zA-Z0-9\s]+/);
      const leadingPunct = leadingPunctMatch ? leadingPunctMatch[0] : '';
      const afterLeading = trimmed.slice(leadingPunct.length);

      const trailingPunctMatch = afterLeading.match(/[^a-zA-Z0-9\s]+$/);
      const trailingPunct = trailingPunctMatch ? trailingPunctMatch[0] : '';
      const core = afterLeading.slice(0, afterLeading.length - trailingPunct.length).trim();
      const cleanCore = core.toLowerCase();

      if (phraseDictionary[cleanOriginal]?.[lang]) {
        node.nodeValue = leadingWhitespace + phraseDictionary[cleanOriginal][lang] + trailingWhitespace;
        return;
      }

      if (cleanCore && phraseDictionary[cleanCore]?.[lang]) {
        node.nodeValue = leadingWhitespace + leadingPunct + phraseDictionary[cleanCore][lang] + trailingPunct + trailingWhitespace;
        return;
      }

      if (singleWordDictionary[cleanOriginal]?.[lang]) {
        node.nodeValue = leadingWhitespace + singleWordDictionary[cleanOriginal][lang] + trailingWhitespace;
        return;
      }

      if (cleanCore && singleWordDictionary[cleanCore]?.[lang]) {
        node.nodeValue = leadingWhitespace + leadingPunct + singleWordDictionary[cleanCore][lang] + trailingPunct + trailingWhitespace;
        return;
      }

      let workingText = original;
      let hasReplaced = false;

      for (const phrase of allDictionaryKeys) {
        if (phrase.length >= 3 && workingText.toLowerCase().includes(phrase)) {
          const trans = phraseDictionary[phrase]?.[lang];
          if (trans) {
            const regex = new RegExp('\\b' + escapeRegExp(phrase) + '\\b', 'gi');
            if (regex.test(workingText)) {
              workingText = workingText.replace(regex, trans);
              hasReplaced = true;
            }
          }
        }
      }

      if (hasReplaced) {
        node.nodeValue = workingText;
      }
    };

    const translateNodeToEnglish = (node: Node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node.nodeValue;
      if (!text || text.trim().length <= 1) return;

      if (originalTextMap.has(node)) {
        const cached = originalTextMap.get(node)!;
        if (!isIndic(cached)) {
          node.nodeValue = cached;
          return;
        }
      }

      if (isIndic(text)) {
        const leadingWhitespace = text.match(/^\s*/)?.[0] || '';
        const trailingWhitespace = text.match(/\s*$/)?.[0] || '';
        const cleanText = text.trim().toLowerCase();

        if (reverseDictionary[cleanText]) {
          const en = toTitleCase(reverseDictionary[cleanText]);
          node.nodeValue = leadingWhitespace + en + trailingWhitespace;
          originalTextMap.set(node, node.nodeValue);
          return;
        }

        let working = text;
        let hasReplaced = false;
        for (const indicKey of allReverseKeys) {
          if (indicKey.length >= 2 && working.toLowerCase().includes(indicKey)) {
            const en = reverseDictionary[indicKey];
            if (en) {
              const regex = new RegExp(escapeRegExp(indicKey), 'gi');
              working = working.replace(regex, toTitleCase(en));
              hasReplaced = true;
            }
          }
        }

        if (hasReplaced) {
          node.nodeValue = working;
          originalTextMap.set(node, working);
        }
      }
    };

    const walk = (root: Node, action: (node: Node) => void) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      let currentNode = walker.nextNode();
      while (currentNode) {
        action(currentNode);
        currentNode = walker.nextNode();
      }
    };

    const root = document.getElementById('root') || document.body;

    if (language === 'en') {
      walk(root, translateNodeToEnglish);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    const activeLang = language as 'hi' | 'te';
    walk(root, translateNodeToEnglish);
    walk(root, (node) => translateNodeToIndic(node, activeLang));

    let timeout: any = null;
    const observer = new MutationObserver((mutations) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              walk(node, (n) => translateNodeToIndic(n, activeLang));
            });
          }
        }
      }, 150);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    return () => {
      if (timeout) clearTimeout(timeout);
      observer.disconnect();
    };
  }, [language]);

  return null;
};