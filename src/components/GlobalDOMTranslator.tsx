import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { phraseDictionary, singleWordDictionary } from '@/i18n/phraseDictionary';

// WeakMap to store original English text nodes so they can be restored accurately when toggling back to English
const originalTextMap = new WeakMap<Node, string>();

export const GlobalDOMTranslator: React.FC = () => {
  const { language } = useLanguage();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const translateNode = (node: Node, lang: 'hi' | 'te') => {
      // Only process Text nodes with meaningful content
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node.nodeValue;
      if (!text || text.trim().length <= 1) return;

      // Don't translate pure numbers or symbols
      if (/^[\d\s.,:%()#+-]+$/.test(text.trim())) return;

      // Don't translate inside code, style, script, input, textarea
      const parent = node.parentElement;
      if (!parent) return;
      const tagName = parent.tagName.toLowerCase();
      if (['script', 'style', 'code', 'pre', 'textarea', 'input'].includes(tagName)) return;
      if (parent.isContentEditable) return;

      // Cache original text once
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, text);
      }

      const original = originalTextMap.get(node) || text;
      const cleanOriginal = original.trim().toLowerCase();

      // 1. Direct phrase lookup
      if (phraseDictionary[cleanOriginal] && phraseDictionary[cleanOriginal][lang]) {
        const translated = phraseDictionary[cleanOriginal][lang];
        // Preserve surrounding whitespaces
        const leading = original.match(/^\s*/)?.[0] || '';
        const trailing = original.match(/\s*$/)?.[0] || '';
        node.nodeValue = leading + translated + trailing;
        return;
      }

      // 2. Direct single word lookup
      if (singleWordDictionary[cleanOriginal] && singleWordDictionary[cleanOriginal][lang]) {
        const translated = singleWordDictionary[cleanOriginal][lang];
        const leading = original.match(/^\s*/)?.[0] || '';
        const trailing = original.match(/\s*$/)?.[0] || '';
        node.nodeValue = leading + translated + trailing;
        return;
      }

      // 3. Multi-phrase replacement inside longer sentences
      let workingText = original;
      let hasReplaced = false;

      // Check common high-frequency phrases
      const commonPhrases = [
        "pathfinders", "pathfinder", "apply to become a trainer", "your request is processing",
        "student portal", "trainer portal", "admin portal", "sign in", "sign up", "create account",
        "get started free", "analyze resume", "career growth path", "career growth pathways",
        "career guide", "skill gap engine", "competency mapping", "preview mode",
        "software engineer", "data analyst", "product manager", "ui/ux designer",
        "take assessment now", "active courses", "trainees enrolled", "verified by pathfinders",
        "ats-optimized templates", "multilingual support", "personalized roadmaps"
      ];

      for (const phrase of commonPhrases) {
        if (workingText.toLowerCase().includes(phrase)) {
          const trans = phraseDictionary[phrase]?.[lang];
          if (trans) {
            const regex = new RegExp(phrase, 'gi');
            workingText = workingText.replace(regex, trans);
            hasReplaced = true;
          }
        }
      }

      if (hasReplaced) {
        node.nodeValue = workingText;
      }
    };

    const restoreNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && originalTextMap.has(node)) {
        node.nodeValue = originalTextMap.get(node)!;
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

    // If English, restore original texts
    if (language === 'en') {
      const root = document.getElementById('root') || document.body;
      walk(root, restoreNode);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    // If Hindi or Telugu, translate initial DOM
    const activeLang = language as 'hi' | 'te';
    const root = document.getElementById('root') || document.body;
    walk(root, (node) => translateNode(node, activeLang));

    // Throttled mutation observer for dynamic elements & page transitions
    let timeout: any = null;
    const observer = new MutationObserver((mutations) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              walk(node, (n) => translateNode(n, activeLang));
            });
          } else if (mutation.type === 'characterData' && mutation.target) {
            translateNode(mutation.target, activeLang);
          }
        }
      }, 150);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });

    observerRef.current = observer;

    return () => {
      if (timeout) clearTimeout(timeout);
      observer.disconnect();
    };
  }, [language]);

  return null;
};
