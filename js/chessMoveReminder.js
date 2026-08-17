const { OLD_PACK_LOOKUP, SOUND_PACK_DATA, DEFAULT_SOUND_PACK, DEFAULT_STORAGE, MIN_REPEAT_TIME, MIN_PERCENTAGE_TIME } = HIKARU_GOTHAM_CONFIG();
let observer;
let recentRandomNumber = 0;

let timer;
let audio;
let repeatIntervalStartTimer;
let repeatInterval;

let lastPlayedClockTime;

function randomPositiveNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function randomPositiveNumberWithoutRepeat(max) {
    let result;
    do {
        result = randomPositiveNumber(max);
    } while (recentRandomNumber === result);

    recentRandomNumber = result;
    return result;
}

function getClockComponent() {
    // Chess.com (Modern, Analysis, Live) + Lichess
    return (
        document.querySelector('.clock-bottom') ||
        document.querySelector('[data-cy="bottom-player"] .clock-component') ||
        document.querySelector('.player-bottom .clock-component') ||
        document.querySelector('#board-layout-player-bottom .clock-component') ||
        document.querySelector('.board-layout-bottom .clock-component') ||
        document.querySelector('.rclock-bottom') ||
        document.querySelectorAll('.clock-component')[1] ||
        document.querySelector('.clock-component')
    );
}

function getCurrentClockFromComponent(clockComponent) {
    if (!clockComponent) return '';
    let clockTimeComponent = clockComponent.querySelector('.time') || clockComponent;
    return clockTimeComponent.innerText.replaceAll('\n', '').trim();
}

function getCurrentClock() {
    return getCurrentClockFromComponent(getClockComponent());
}

function getAudio(who) {
    let pack = who[randomPositiveNumber(who.length) - 1];
    let { folder, voicelineNumber } = SOUND_PACK_DATA[pack];
    let audioIndex = voicelineNumber === 1 ? 1 : randomPositiveNumberWithoutRepeat(voicelineNumber);
    return `audio/${folder}/${audioIndex}.mp3`;
}

async function playAudio(who) {
    if (!who || !who.length) return;
    let currentClock = getCurrentClock();
    if (currentClock === lastPlayedClockTime) {
        resetTimers();
        return;
    }
    lastPlayedClockTime = currentClock;
    let audioUrl = getAudio(who);
    console.log('MOVE Extension: Playing audio ->', audioUrl);
    audio = new Audio(chrome.runtime.getURL(audioUrl));
    try {
        await audio.play();
    } catch (err) {
        console.warn('MOVE Extension audio error:', err.message);
    }
}

function calcTime(currentClock, type, number) {
    if (type === 'percentage') {
        return Math.max(parseSecondsFromClock(currentClock) * number * 10, MIN_PERCENTAGE_TIME);
    }
    return number * 1000;
}

function parseSecondsFromClock(clock) {
    if (!clock) return 0;
    let clean = clock.replace(/[^\d:]/g, '');
    let split = clean.split(':').reverse();
    let sec = parseFloat(split[0]) || 0;
    let min = parseInt(split[1] || 0);
    let hour = parseInt(split[2] || 0);
    return sec + min * 60 + hour * 3600;
}

function resetTimers() {
    clearTimeout(timer);
    clearTimeout(repeatIntervalStartTimer);
    clearInterval(repeatInterval);
}

function isPlayerTurn(clockElement) {
    if (!clockElement) return false;
    const classList = clockElement.className + ' ' + (clockElement.parentElement ? clockElement.parentElement.className : '');
    return (
        classList.includes('clock-playerTurn') ||
        classList.includes('clock-player-turn') ||
        classList.includes('running') ||
        classList.includes('clock-running') ||
        classList.includes('player-turn') ||
        clockElement.closest('.clock-running') !== null ||
        clockElement.closest('.clock-player-turn') !== null
    );
}

function attachObserver() {
    let target = getClockComponent();
    if (!target) return;

    if (observer) observer.disconnect();

    console.log('MOVE Extension: Clock target attached ->', target);

    let lastTurnState = false;

    observer = new MutationObserver(function () {
        let currentClock = getCurrentClockFromComponent(target);
        let currentTurn = isPlayerTurn(target);

        if (currentTurn !== lastTurnState) {
            lastTurnState = currentTurn;
            resetTimers();

            if (audio !== undefined) audio.pause();

            if (currentTurn) {
                console.log('MOVE Extension: Your turn started. Clock:', currentClock);
                chrome.storage.sync.get(
                    DEFAULT_STORAGE,
                    function ({ who, number, type, repeatEnabled, repeatNumber, repeatType }) {
                        let formattedWho = typeof who === 'object' ? who : OLD_PACK_LOOKUP[who];
                        let timeToTell = calcTime(currentClock, type, number);
                        console.log(`MOVE Extension: Timer scheduled for ${timeToTell}ms`);

                        timer = setTimeout(playAudio, timeToTell, formattedWho);

                        if (repeatEnabled) {
                            repeatIntervalStartTimer = setTimeout(function () {
                                const timeToRepeat = Math.max(
                                    calcTime(currentClock, repeatType, repeatNumber),
                                    MIN_REPEAT_TIME
                                );
                                repeatInterval = setInterval(playAudio, timeToRepeat, formattedWho);
                            }, timeToTell);
                        }
                    }
                );
            } else {
                console.log('MOVE Extension: Turn ended. Timers reset.');
            }
        }
    });

    observer.observe(target, {
        attributes: true,
        attributeFilter: ['class', 'aria-label'],
        subtree: true,
        characterData: true,
        childList: true
    });
}

setInterval(function () {
    let clock = getClockComponent();
    if (clock && (!observer || !document.contains(clock))) {
        attachObserver();
    }
}, 1500);