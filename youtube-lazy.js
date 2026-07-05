// ============================================================
// youtube-lazy.js
// Lazy-load do YouTube IFrame API após scroll OU 3s timeout.
// Script isolado do HTML para permitir remoção de 'unsafe-inline'
// da CSP via nonce/hash.
// @ts-check
// ============================================================

(() => {
    'use strict';

    /** @type {YTPlayer | undefined} */
    let ytPlayer;
    /** @type {boolean} */
    let apiReady = false;
    /** @type {boolean} */
    let apiLoading = false;

    // YTPlayer é global injetado pela IFrame API
    /** Caller must rely on YT namespace at runtime; loose typing here.
     * @typedef {Object} YTPlayer
     * @property {(s: number)=>void} mute
     * @property {()=>void} playVideo
     */

    // Declaração explícita de YT (evita warning TS em tsconfig strict)
    /** @type {any} */
    let _YT; void _YT;

    /**
     * Chamado automaticamente pela IFrame API quando termina de carregar.
     * @returns {void}
     */
    window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
        apiReady = true;
        mountPlayer();
    };

    /** @returns {void} */
    function mountPlayer() {
        if (!apiReady || ytPlayer) return;
        const container = document.getElementById('yt-player');
        if (!container) return;
        /** @type {any} */
        const YT = window.YT;
        if (!YT || !YT.Player) return;
        ytPlayer = new YT.Player('yt-player', {
            videoId: 'gwBz0OCk_hA',
            playerVars: {
                autoplay: 1, mute: 1, loop: 1, playlist: 'gwBz0OCk_hA',
                controls: 0, playsinline: 1, modestbranding: 1, rel: 0,
                disablekb: 1, fs: 0
            },
            events: {
                onReady: function(/** @type {{target:YTPlayer}} */ e) {
                    e.target.mute();
                    e.target.playVideo();
                },
                onStateChange: function(/** @type {{data:number}} */ e) {
                    if (e.data === 1 /* ENDED */) {
                        e.target.playVideo();
                    }
                }
            }
        });
    }

    /**
     * Carrega o script de IFrame API apenas uma vez.
     * @returns {void}
     */
    function loadYouTubeAPI() {
        if (apiLoading || apiReady) return;
        apiLoading = true;
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onload = () => { apiLoading = false; };
        tag.onerror = () => { apiLoading = false; };
        document.head.appendChild(tag);
    }

    // Lazy trigger 1: primeiro scroll
    window.addEventListener('scroll', function ytLazy() {
        loadYouTubeAPI();
        window.removeEventListener('scroll', ytLazy);
    }, { once: true, passive: true });

    // Lazy trigger 2: 3s timeout (fallback se usuário nunca scrollar)
    setTimeout(loadYouTubeAPI, 3000);
})();
