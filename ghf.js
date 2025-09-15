// DOM Elements
const drillStartView = document.getElementById('drill-start-view');
const drillSimulationView = document.getElementById('drill-simulation-view');
const drillFeedbackView = document.getElementById('drill-feedback-view');
const drillStatus = document.getElementById('drill-status');
const drillChoices = document.getElementById('drill-choices');
const feedbackCard = document.getElementById('feedback-card');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const quickTip = document.getElementById('quick-tip');
const quickTipText = document.getElementById('quick-tip-text');
const badgeUnlock = document.getElementById('badge-unlock');
const scamSelect = document.getElementById('scam-select');

const assistStartView = document.getElementById('assist-start-view');
const assistSimulationView = document.getElementById('assist-simulation-view');
const assistFeedbackView = document.getElementById('assist-feedback-view');
const assistStatus = document.getElementById('assist-status');
const assistChoices = document.getElementById('assist-choices');

const visualizerDrill = document.getElementById('visualizer-drill');
const visualizerAssist = document.getElementById('visualizer-assist');

// Speech Synthesis Setup
const speechSynth = window.speechSynthesis;
let availableVoices = [];
let voicesLoaded = false;

function getVoices() {
    return new Promise(resolve => {
        let v = speechSynth.getVoices();
        if (v.length > 0) resolve(v);
        else speechSynth.onvoiceschanged = () => resolve(speechSynth.getVoices());
    });
}
async function loadVoices() {
    availableVoices = await getVoices();
    voicesLoaded = true;
}
loadVoices();

function speak(text, voiceConfig, visualizer, callback) {
    if (!voicesLoaded) {
        console.error("Voices not loaded.");
        if (callback) callback();
        return;
    }
    speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = availableVoices.find(v => v.name.includes(voiceConfig.name)) || availableVoices.find(v => v.lang === 'en-US') || availableVoices[0];
    utterance.pitch = voiceConfig.pitch || 1;
    utterance.rate = voiceConfig.rate || 1;
    utterance.onstart = () => visualizer.classList.remove('inactive');
    utterance.onend = () => {
        visualizer.classList.add('inactive');
        if (callback) callback();
    };
    speechSynth.speak(utterance);
}

function playSafetyDrill() {
    drillStartView.classList.add('hidden');
    drillSimulationView.classList.remove('hidden');
    drillFeedbackView.classList.add('hidden');
    badgeUnlock.classList.add('hidden');
    quickTip.classList.add('hidden');
    drillChoices.innerHTML = '';

    const scenario = scamSelect.value;
    let scammerPrompt = "Hello, I am calling from the bank, I need your OTP now!";
    if (scenario === 'fedex') {
        scammerPrompt = "This is FedEx Security. We have a package for you with illegal items. Provide your Aadhaar number to avoid a police case.";
    }

    const calmBot = { name: 'Google US English', pitch: 1.2, rate: 0.9 };
    const scammer = { name: 'Google US English', pitch: 0.8, rate: 1.1 };
    
    drillStatus.textContent = 'Bot is speaking...';
    speak("Welcome to your weekly Safety Drill.", calmBot, visualizerDrill, () => {
        setTimeout(() => {
            drillStatus.textContent = 'Scammer is speaking...';
            speak(scammerPrompt, scammer, visualizerDrill, () => {
                drillStatus.textContent = 'How do you respond?';
                drillChoices.innerHTML = `
                    <button onclick="handleDrillChoice(false)" class="w-full text-left p-3 bg-red-800 rounded-lg hover:bg-red-700">"Okay, my OTP is 123-456."</button>
                    <button onclick="handleDrillChoice(true)" class="w-full text-left p-3 bg-green-800 rounded-lg hover:bg-green-700">"My bank never asks for OTPs. I will call them back."</button>
                `;
            });
        }, 1000);
    });
}

function handleDrillChoice(isCorrect) {
    drillChoices.innerHTML = '';
    drillSimulationView.classList.add('hidden');
    drillFeedbackView.classList.remove('hidden');
    
    if (isCorrect) {
        feedbackCard.className = "p-4 rounded-lg bg-green-900 bg-opacity-50 border border-green-500";
        feedbackTitle.textContent = "Simulation Passed!";
        feedbackTitle.className = "text-2xl font-bold text-green-400";
        feedbackMessage.textContent = "Score: 100/100 | Rating: Guardian";
        badgeUnlock.classList.remove('hidden');
        quickTip.classList.add('hidden');
    } else {
        feedbackCard.className = "p-4 rounded-lg bg-red-900 bg-opacity-50 border border-red-500";
        feedbackTitle.textContent = "Let's Review";
        feedbackTitle.className = "text-2xl font-bold text-red-400";
        feedbackMessage.textContent = "You shared a secret code. A real bank or company will never ask for your OTP on a call.";
        badgeUnlock.classList.add('hidden');
        quickTip.classList.remove('hidden');
        quickTipText.textContent = "Your OTP is like a key to your bank locker. Never share it with anyone over the phone.";
    }
}

function resetDrill() {
    drillStartView.classList.remove('hidden');
    drillSimulationView.classList.add('hidden');
    drillFeedbackView.classList.add('hidden');
}

function playOneCallAssist() {
    assistStartView.classList.add('hidden');
    assistSimulationView.classList.remove('hidden');
    assistFeedbackView.classList.add('hidden');
    assistChoices.innerHTML = '';

    const calmBot = { name: 'Google US English', pitch: 1.2, rate: 0.9 };
    const panickedUser = { name: 'Google US English', pitch: 1.4, rate: 1.2 };
    
    assistStatus.textContent = 'User is speaking...';
    speak("I think I've been scammed!", panickedUser, visualizerAssist, () => {
        setTimeout(() => {
            assistStatus.textContent = 'Bot is speaking...';
            speak("Please do not panic. I am here to help you. Welcome to the One-Call Assist. Please select your bank.", calmBot, visualizerAssist, () => {
                assistStatus.textContent = 'Step 1: Secure Your Bank Account';
                assistChoices.innerHTML = `
                    <button onclick="handleBankChoice('State Bank of India')" class="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600">State Bank of India</button>
                    <button onclick="handleBankChoice('HDFC Bank')" class="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600">HDFC Bank</button>
                    <button onclick="handleBankChoice('ICICI Bank')" class="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600">ICICI Bank</button>
                `;
            });
        }, 500);
    });
}

function handleBankChoice(bankName) {
    assistChoices.innerHTML = '';
    const calmBot = { name: 'Google US English', pitch: 1.2, rate: 0.9 };
    assistStatus.textContent = `Connecting to ${bankName}...`;
    speak(`Connecting you to the official ${bankName} fraud hotline now. Please stay on the line.`, calmBot, visualizerAssist, () => {
        setTimeout(() => {
            recordEvidence();
        }, 2000);
    });
}

function recordEvidence() {
    const calmBot = { name: 'Google US English', pitch: 1.2, rate: 0.9 };
    assistStatus.textContent = 'Step 2: Record Your Evidence';
    speak("Now that your bank is alerted, let's create your evidence record. After the beep, please state the scammer's phone number and the full story.", calmBot, visualizerAssist, () => {
        setTimeout(() => {
            assistStatus.innerHTML = `
                <p class="text-red-500 font-bold animate-pulse">RECORDING...</p>
                <p class="text-sm">(User is now speaking their testimony)</p>
            `;
            setTimeout(() => {
                connectToHelpline();
            }, 4000); // Simulate recording for 4 seconds
        }, 500);
    });
}

function connectToHelpline() {
    const calmBot = { name: 'Google US English', pitch: 1.2, rate: 0.9 };
    assistStatus.textContent = 'Step 3: Official Reporting';
    speak("Your evidence has been saved. The final step is to report this to the national cybercrime helpline. I will connect you now.", calmBot, visualizerAssist, () => {
        setTimeout(() => {
            assistSimulationView.classList.add('hidden');
            assistFeedbackView.classList.remove('hidden');
        }, 1000);
    });
}

function resetAssist() {
    assistStartView.classList.remove('hidden');
    assistSimulationView.classList.add('hidden');
    assistFeedbackView.classList.add('hidden');
}