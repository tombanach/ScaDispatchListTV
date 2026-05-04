(function () {
    var dashboard = document.querySelector(".tv-page");
    var progressBar = document.querySelector(".scroll-progress-bar");

    if (!dashboard) {
        return;
    }

    var waitMs = 8000;
    var resumeAfterManualMs = 10000;
    var scrollMsPerPixel = 55;
    var scrollKeys = {
        ArrowDown: true,
        ArrowUp: true,
        PageDown: true,
        PageUp: true,
        Home: true,
        End: true,
        " ": true,
        Spacebar: true
    };

    var scrollTimer = null;
    var waitTimer = null;
    var resumeTimer = null;
    var pausedByUser = false;
    var programmaticScrollUntil = 0;

    function now() {
        return new Date().getTime();
    }

    function getScrollTop() {
        return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function getViewportHeight() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    }

    function getScrollHeight() {
        return Math.max(
            document.documentElement.scrollHeight,
            document.body ? document.body.scrollHeight : 0
        );
    }

    function getMaxScroll() {
        return Math.max(0, getScrollHeight() - getViewportHeight());
    }

    function markProgrammaticScroll() {
        programmaticScrollUntil = now() + 300;
    }

    function updateProgress() {
        if (!progressBar) {
            return;
        }

        var maxScroll = getMaxScroll();
        var progress = maxScroll === 0 ? 0 : Math.min(getScrollTop() / maxScroll, 1);
        progressBar.style.width = (progress * 100) + "%";
    }

    function clearAutoTimers() {
        if (scrollTimer) {
            clearInterval(scrollTimer);
            scrollTimer = null;
        }

        if (waitTimer) {
            clearTimeout(waitTimer);
            waitTimer = null;
        }
    }

    function startScrolling() {
        clearAutoTimers();
        pausedByUser = false;
        updateProgress();

        if (getMaxScroll() <= 1) {
            return;
        }

        scrollTimer = setInterval(scrollStep, scrollMsPerPixel);
    }

    function scheduleStart(delay) {
        clearAutoTimers();
        waitTimer = setTimeout(startScrolling, delay);
    }

    function scrollStep() {
        if (pausedByUser) {
            return;
        }

        var maxScroll = getMaxScroll();

        if (getScrollTop() >= maxScroll - 1) {
            clearAutoTimers();
            updateProgress();

            waitTimer = setTimeout(function () {
                markProgrammaticScroll();
                window.scrollTo(0, 0);
                updateProgress();
                scheduleStart(waitMs);
            }, waitMs);

            return;
        }

        markProgrammaticScroll();
        window.scrollBy(0, 1);
        updateProgress();
    }

    function pauseAutoScroll() {
        pausedByUser = true;
        clearAutoTimers();
        clearTimeout(resumeTimer);

        resumeTimer = setTimeout(function () {
            pausedByUser = false;
            startScrolling();
        }, resumeAfterManualMs);
    }

    function handleScroll() {
        updateProgress();

        if (now() > programmaticScrollUntil) {
            pauseAutoScroll();
        }
    }

    function handleKeydown(event) {
        if (scrollKeys[event.key]) {
            pauseAutoScroll();
        }
    }

    updateProgress();
    window.addEventListener("scroll", handleScroll, false);
    window.addEventListener("wheel", pauseAutoScroll, false);
    window.addEventListener("touchstart", pauseAutoScroll, false);
    window.addEventListener("touchmove", pauseAutoScroll, false);
    window.addEventListener("mousedown", pauseAutoScroll, false);
    window.addEventListener("keydown", handleKeydown, false);
    window.addEventListener("resize", updateProgress, false);

    scheduleStart(waitMs);
})();
