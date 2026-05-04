(() => {
    const dashboard = document.querySelector(".tv-page");
    const scrollContainer = document.querySelector(".table-scroll-container");
    const progressBar = document.querySelector(".scroll-progress-bar");

    if (!dashboard || !scrollContainer) {
        return;
    }

    const waitMs = 8000;
    const resumeAfterManualMs = 10000;
    const scrollMsPerPixel = 55;
    const returnDuration = 2500;
    const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);

    let runToken = 0;
    let pausedByUser = false;
    let resumeTimer;
    let animationFrame;

    const getMaxScroll = () => Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);

    const updateProgress = () => {
        if (!progressBar) {
            return;
        }

        const maxScroll = getMaxScroll();
        const progress = maxScroll === 0 ? 0 : Math.min(scrollContainer.scrollTop / maxScroll, 1);
        progressBar.style.width = `${progress * 100}%`;
    };

    const wait = (duration, token) => new Promise(resolve => {
        setTimeout(() => resolve(token === runToken && !pausedByUser), duration);
    });

    const animateTo = (target, duration, token) => new Promise(resolve => {
        const start = scrollContainer.scrollTop;
        const distance = target - start;

        if (Math.abs(distance) < 1) {
            updateProgress();
            resolve(token === runToken && !pausedByUser);
            return;
        }

        const startTime = performance.now();

        const step = now => {
            if (token !== runToken || pausedByUser) {
                updateProgress();
                resolve(false);
                return;
            }

            const progress = Math.min((now - startTime) / duration, 1);
            scrollContainer.scrollTo({ top: start + distance * progress });
            updateProgress();

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
                return;
            }

            resolve(true);
        };

        animationFrame = requestAnimationFrame(step);
    });

    const runAutoScroll = async (waitBeforeStart) => {
        const token = ++runToken;
        pausedByUser = false;

        if (waitBeforeStart && !await wait(waitMs, token)) {
            return;
        }

        while (token === runToken && !pausedByUser) {
            const maxScroll = getMaxScroll();
            const distanceToBottom = Math.max(0, maxScroll - scrollContainer.scrollTop);

            if (distanceToBottom > 1 && !await animateTo(maxScroll, Math.max(700, distanceToBottom * scrollMsPerPixel), token)) {
                return;
            }

            if (!await wait(waitMs, token)) {
                return;
            }

            if (!await animateTo(0, returnDuration, token)) {
                return;
            }

            if (!await wait(waitMs, token)) {
                return;
            }
        }
    };

    const pauseAutoScroll = () => {
        pausedByUser = true;
        runToken += 1;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
            runAutoScroll(false);
        }, resumeAfterManualMs);
    };

    const scrollByKey = event => {
        if (!scrollKeys.has(event.key)) {
            return;
        }

        pauseAutoScroll();
        event.preventDefault();

        const pageStep = scrollContainer.clientHeight * 0.85;
        const smallStep = 70;
        let target = scrollContainer.scrollTop;

        switch (event.key) {
            case "ArrowDown":
                target += smallStep;
                break;
            case "ArrowUp":
                target -= smallStep;
                break;
            case "PageDown":
                target += pageStep;
                break;
            case "PageUp":
                target -= pageStep;
                break;
            case "Home":
                target = 0;
                break;
            case "End":
                target = getMaxScroll();
                break;
            default:
                target += event.shiftKey ? -pageStep : pageStep;
                break;
        }

        scrollContainer.scrollTo({ top: Math.max(0, Math.min(getMaxScroll(), target)) });
        updateProgress();
    };

    updateProgress();
    scrollContainer.addEventListener("scroll", updateProgress, { passive: true });
    scrollContainer.addEventListener("wheel", pauseAutoScroll, { passive: true });
    scrollContainer.addEventListener("touchstart", pauseAutoScroll, { passive: true });
    scrollContainer.addEventListener("touchmove", pauseAutoScroll, { passive: true });
    scrollContainer.addEventListener("mousedown", pauseAutoScroll);
    window.addEventListener("resize", updateProgress);
    window.addEventListener("keydown", scrollByKey);

    runAutoScroll(true);
})();
