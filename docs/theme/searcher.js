'use strict';

/* global Mark, path_to_root */

// Custom searcher.js with Chinese segmentation support using Segmentit.
// Replaces mdBook's default searcher to segment both query and document
// content before matching.

window.search = window.search || {};
(function search() {
    if (!Mark) {
        return;
    }

    const search_wrap = document.getElementById('search-wrapper');
    const searchbar_outer = document.getElementById('searchbar-outer');
    const searchbar = document.getElementById('searchbar');
    const searchresults = document.getElementById('searchresults');
    const searchresults_outer = document.getElementById('searchresults-outer');
    const searchresults_header = document.getElementById('searchresults-header');
    const searchicon = document.getElementById('search-toggle');
    const content = document.getElementById('content');

    const mark_exclude = ['text'];
    const marker = new Mark(content);
    const URL_SEARCH_PARAM = 'search';
    const URL_MARK_PARAM = 'highlight';

    let current_searchterm = '';
    let doc_urls = [];
    let results_options = {
        teaser_word_count: 30,
        limit_results: 30,
    };
    let teaser_count = 0;

    // Internal caches
    let rawIndexJson = null; // JSON object from searchindex.js
    let docsCache = null;    // Array of { id, url, title, body, breadcrumbs, titleFreq, bodyFreq }
    let segmenter = null;    // Segmentit instance

    // Utilities
    function hasFocus() { return searchbar === document.activeElement; }
    function removeChildren(elem) { while (elem.firstChild) elem.removeChild(elem.firstChild); }

    function parseURL(url) {
        const a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            params: (function() {
                const ret = {}; const seg = a.search.replace(/^\?/, '').split('&');
                for (const part of seg) { if (!part) continue; const s = part.split('='); ret[s[0]] = s[1]; }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^/?#]+)$/i) || ['', ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^/])/, '/$1'),
        };
    }

    function renderURL(urlobject) {
        let url = urlobject.protocol + '://' + urlobject.host;
        if (urlobject.port !== '') url += ':' + urlobject.port;
        url += urlobject.path;
        let joiner = '?';
        for (const prop in urlobject.params) {
            if (Object.prototype.hasOwnProperty.call(urlobject.params, prop)) {
                url += joiner + prop + '=' + urlobject.params[prop];
                joiner = '&';
            }
        }
        if (urlobject.hash !== '') url += '#' + urlobject.hash;
        return url;
    }

    const escapeHTML = (function() {
        const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;' };
        const repl = function(c) { return MAP[c]; };
        return function(s) { return (s || '').replace(/[&<>"']/g, repl); };
    })();

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function formatSearchMetric(count, searchterm) {
        if (count === 1) return count + " 条结果: '" + searchterm + "'";
        if (count === 0) return "未找到: '" + searchterm + "'";
        return count + " 条结果: '" + searchterm + "'";
    }

    function makeTeaserCN(body, searchterms) {
        if (!body) return '';
        const text = body.toString();
        let pos = -1;
        for (const t of searchterms) { pos = text.indexOf(t); if (pos !== -1) break; }
        if (pos === -1) pos = 0;
        const start = Math.max(0, pos - 30);
        const end = Math.min(text.length, pos + 80);
        let snippet = text.slice(start, end);
        let html = escapeHTML(snippet);
        // Highlight all terms (longer terms first to avoid nested replacements)
        const terms = Array.from(new Set(searchterms.filter(Boolean)));
        terms.sort((a, b) => b.length - a.length);
        for (const t of terms) {
            const escToken = escapeHTML(t);
            html = html.replace(new RegExp(escapeRegExp(escToken), 'g'), '<em>' + escToken + '</em>');
        }
        return (start > 0 ? '…' : '') + html + (end < text.length ? '…' : '');
    }

    function formatSearchResult(result, searchterms) {
        const teaser = makeTeaserCN(result.doc.body, searchterms);
        teaser_count++;
        const url = doc_urls[result.ref].split('#');
        if (url.length === 1) url.push('');
        const encoded_search = encodeURIComponent(searchterms.join(' ')).replace(/'/g, '%27');
        return '<a href="' + path_to_root + url[0] + '?' + URL_MARK_PARAM + '=' + encoded_search + '#' + url[1] + '" aria-details="teaser_' + teaser_count + '">' + result.doc.breadcrumbs + '</a>' + '<span class="teaser" id="teaser_' + teaser_count + '" aria-label="Search Result Teaser">' + teaser + '</span>';
    }

    // Segmentit helpers
    function ensureSegmenter(callback) {
        if (segmenter) { callback(); return; }
        function initSeg() {
            try {
                if (window.Segmentit && window.Segmentit.Segment && window.Segmentit.useDefault) {
                    segmenter = window.Segmentit.useDefault(new window.Segmentit.Segment());
                }
            } catch (e) { console.error('Segmentit init failed:', e); }
            callback();
        }
        if (window.Segmentit) { initSeg(); return; }
        // Lazy-load script
        const id = 'segmentit-umd';
        if (document.getElementById(id)) { document.getElementById(id).addEventListener('load', initSeg); return; }
        const script = document.createElement('script');
        script.src = (window.path_to_segmentit_js || (path_to_root + 'segmentit.umd.js'));
        script.id = id;
        script.onload = initSeg;
        script.onerror = (error) => console.error('Failed to load segmentit:', error);
        document.head.append(script);
    }

    function tokenizeCN(text) {
        if (!text) return [];
        let tokens = [];
        try {
            if (segmenter) {
                tokens = segmenter.doSegment(text, { simple: true, stripPunctuation: true });
            } else {
                // Fallback: split into individual CJK characters and words
                tokens = text.split(/\s+/).flatMap(w => w.match(/[\u4E00-\u9FFF]|[A-Za-z0-9_]+/g) || []);
            }
        } catch (e) {
            tokens = text.split(/\s+/).filter(Boolean);
        }
        // De-duplicate consecutive spaces and short tokens
        return tokens.filter(t => t && t.trim()).map(t => t.trim());
    }

    function buildFreq(tokens) {
        const m = new Map();
        for (const t of tokens) m.set(t, (m.get(t) || 0) + 1);
        return m;
    }

    function buildDocsCache() {
        if (docsCache) return;
        docsCache = [];
        if (!rawIndexJson) return;
        const store = rawIndexJson.documentStore && rawIndexJson.documentStore.docs ? rawIndexJson.documentStore.docs : {};
        for (const id in store) {
            if (!Object.prototype.hasOwnProperty.call(store, id)) continue;
            const d = store[id] || {};
            docsCache.push({
                id: parseInt(id, 10),
                url: doc_urls[parseInt(id, 10)] || '',
                title: d.title || '',
                body: d.body || '',
                breadcrumbs: d.breadcrumbs || (d.title || ''),
                titleFreq: null,
                bodyFreq: null,
            });
        }
    }

    function ensureDocFreqs(doc) {
        if (doc.titleFreq && doc.bodyFreq) return;
        const titleTokens = tokenizeCN(doc.title);
        const bodyTokens = tokenizeCN(doc.body);
        doc.titleFreq = buildFreq(titleTokens);
        doc.bodyFreq = buildFreq(bodyTokens);
    }

    function scoreDoc(doc, queryTokens) {
        ensureDocFreqs(doc);
        let score = 0;
        for (const qt of queryTokens) {
            score += (doc.titleFreq.get(qt) || 0) * 5;
            score += (doc.bodyFreq.get(qt) || 0) * 1;
        }
        return score;
    }

    function init(config) {
        results_options = config.results_options;
        doc_urls = config.doc_urls;
        rawIndexJson = config.index; // keep raw, we don't use elasticlunr

        searchbar_outer.classList.remove('searching');
        searchbar.focus();

        // Build docs cache once segmenter is ready
        ensureSegmenter(() => {
            buildDocsCache();
            const searchterm = searchbar.value.trim();
            if (searchterm !== '') {
                searchbar.classList.add('active');
                doSearch(searchterm);
            }
        });
    }

    function initSearchInteractions(config) {
        searchicon.addEventListener('click', () => { searchIconClickHandler(); }, false);
        searchbar.addEventListener('keyup', () => { searchbarKeyUpHandler(); }, false);
        document.addEventListener('keydown', e => { globalKeyHandler(e); }, false);
        window.onpopstate = () => { doSearchOrMarkFromUrl(); };
        document.addEventListener('submit', e => { e.preventDefault(); }, false);
        doSearchOrMarkFromUrl();
        config.hasFocus = hasFocus;
    }

    initSearchInteractions(window.search);

    function unfocusSearchbar() {
        const tmp = document.createElement('input');
        tmp.setAttribute('style', 'position: absolute; opacity: 0;');
        searchicon.appendChild(tmp); tmp.focus(); tmp.remove();
    }

    function doSearchOrMarkFromUrl() {
        const url = parseURL(window.location.href);
        if (Object.prototype.hasOwnProperty.call(url.params, URL_SEARCH_PARAM) && url.params[URL_SEARCH_PARAM] !== '') {
            showSearch(true);
            searchbar.value = decodeURIComponent((url.params[URL_SEARCH_PARAM] + '').replace(/\+/g, '%20'));
            searchbarKeyUpHandler();
        } else {
            showSearch(false);
        }

        if (Object.prototype.hasOwnProperty.call(url.params, URL_MARK_PARAM)) {
            const words = decodeURIComponent(url.params[URL_MARK_PARAM]).split(' ');
            marker.mark(words, { exclude: mark_exclude });
            const markers = document.querySelectorAll('mark');
            const hide = () => {
                for (let i = 0; i < markers.length; i++) {
                    markers[i].classList.add('fade-out');
                    window.setTimeout(() => { marker.unmark(); }, 300);
                }
            };
            for (let i = 0; i < markers.length; i++) { markers[i].addEventListener('click', hide); }
        }
    }

    function globalKeyHandler(e) {
        if (e.altKey || e.ctrlKey || e.metaKey) { return; }
        const active = document.activeElement;
        if (e.key === 'f' && (active === document.body || hasFocus())) {
            e.preventDefault(); showSearch(true); searchbar.select(); return;
        }
        if (searchbar.value === '' && !searchresults_outer.classList.contains('hidden')) {
            const focused = searchresults.querySelector('li.focus');
            if (!focused) return;
            e.preventDefault();
            if (e.key === 'ArrowDown') {
                const next = focused.nextElementSibling; if (next) { focused.classList.remove('focus'); next.classList.add('focus'); }
            } else if (e.key === 'ArrowUp') {
                focused.classList.remove('focus'); const prev = focused.previousElementSibling; if (prev) { prev.classList.add('focus'); } else { searchbar.select(); }
            } else { window.location.assign(focused.querySelector('a')); }
        }
    }

    function loadScript(url, id, onload) {
        if (document.getElementById(id)) { if (onload) { const el = document.getElementById(id); if (el.dataset.loaded === '1') onload(); else el.addEventListener('load', onload); } return; }
        const script = document.createElement('script');
        script.src = url; script.id = id; script.defer = true;
        script.onload = () => { script.dataset.loaded = '1'; if (onload) onload(); };
        script.onerror = (error) => console.error(`Failed to load \`${url}\`: ${error}`);
        document.head.append(script);
    }

    function showSearch(yes) {
        if (yes) {
            searchbar_outer.classList.add('searching');
            // Ensure Segmentit is loaded before index; init() will be called from index load
            const loadIndex = () => loadScript(
                window.path_to_searchindex_js || (path_to_root + 'searchindex.js'),
                'search-index',
                () => init(window.search)
            );
            ensureSegmenter(loadIndex);
            search_wrap.classList.remove('hidden');
            searchicon.setAttribute('aria-expanded', 'true');
        } else {
            search_wrap.classList.add('hidden');
            searchicon.setAttribute('aria-expanded', 'false');
            const results = searchresults.children;
            for (let i = 0; i < results.length; i++) results[i].classList.remove('focus');
        }
    }

    function showResults(yes) { if (yes) searchresults_outer.classList.remove('hidden'); else searchresults_outer.classList.add('hidden'); }

    function searchIconClickHandler() {
        if (search_wrap.classList.contains('hidden')) { showSearch(true); window.scrollTo(0, 0); searchbar.select(); } else { showSearch(false); }
    }

    function setSearchUrlParameters(searchterm, action) {
        const url = parseURL(window.location.href);
        const first_search = !Object.prototype.hasOwnProperty.call(url.params, URL_SEARCH_PARAM);
        if (searchterm !== '' || action === 'push_if_new_search_else_replace') {
            url.params[URL_SEARCH_PARAM] = searchterm; delete url.params[URL_MARK_PARAM]; url.hash = '';
        } else { delete url.params[URL_MARK_PARAM]; delete url.params[URL_SEARCH_PARAM]; }
        if (action === 'push' || (action === 'push_if_new_search_else_replace' && first_search)) {
            history.pushState({}, document.title, renderURL(url));
        } else if (action === 'replace' || (action === 'push_if_new_search_else_replace' && !first_search)) {
            history.replaceState({}, document.title, renderURL(url));
        }
    }

    function searchbarKeyUpHandler() {
        const searchterm = searchbar.value.trim();
        if (searchterm !== '') { searchbar.classList.add('active'); doSearch(searchterm); }
        else { searchbar.classList.remove('active'); showResults(false); removeChildren(searchresults); }
        setSearchUrlParameters(searchterm, 'push_if_new_search_else_replace');
        marker.unmark();
    }

    function doSearch(searchterm) {
        if (current_searchterm === searchterm) return;
        if (!rawIndexJson) return;
        current_searchterm = searchterm;
        searchbar_outer.classList.add('searching');

        ensureSegmenter(() => {
            buildDocsCache();
            const qTokens = tokenizeCN(searchterm);
            const scored = [];
            for (const doc of docsCache) {
                const s = scoreDoc(doc, qTokens);
                if (s > 0) scored.push({ ref: doc.id, score: s, doc: { title: doc.title, body: doc.body, breadcrumbs: doc.breadcrumbs } });
            }
            scored.sort((a, b) => b.score - a.score);
            const resultcount = Math.min(scored.length, results_options.limit_results);
            searchresults_header.innerText = formatSearchMetric(resultcount, qTokens.join(' '));
            removeChildren(searchresults);
            for (let i = 0; i < resultcount; i++) {
                const li = document.createElement('li');
                li.innerHTML = formatSearchResult(scored[i], qTokens);
                searchresults.appendChild(li);
            }
            showResults(true);
            searchbar_outer.classList.remove('searching');
        });
    }

    // Exported API
    search.hasFocus = hasFocus;
})(window.search);

