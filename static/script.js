// ============================================
// LANGUAGE TOGGLE
// ============================================
let currentLang = 'en';
const langBtn = document.getElementById('langBtn');

if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        langBtn.textContent = currentLang === 'en' ? 'हिंदी' : 'English';
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`);
        });
    });
}

// ============================================
// EXERCISES LOAD
// ============================================
async function loadExercises() {
    const container = document.getElementById('exerciseList');
    if (!container) return;
    try {
        const res = await fetch('/api/exercises');
        const data = await res.json();
        container.innerHTML = '';
        data.forEach(ex => {
            const name = currentLang === 'hi' ? ex.hindi : ex.name;
            container.innerHTML += `
                <div class="exercise-card bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition">
                    <div class="flex justify-center mb-3 bg-gray-50 rounded-lg p-3">
                        <img src="${ex.animation}" alt="${ex.name}" class="w-40 h-40 object-contain">
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 text-center mb-1" data-en="${ex.name}" data-hi="${ex.hindi}">${name}</h4>
                    <p class="text-center text-gray-500 text-sm mb-3">${ex.body_part}</p>
                    <div class="bg-orange-100 text-orange-700 text-center py-2 rounded-lg text-sm font-medium">${ex.sets}</div>
                </div>
            `;
        });
    } catch (err) { console.error(err); }
}

// ============================================
// DIET LOAD
// ============================================
async function loadDiet() {
    const container = document.getElementById('dietList');
    if (!container) return;
    try {
        const res = await fetch('/api/diet');
        const data = await res.json();
        container.innerHTML = '';
        data.forEach(item => {
            container.innerHTML += `
                <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${item.goal}</h3>
                    <p class="text-gray-600 mb-3">${item.tip}</p>
                    <div class="flex flex-wrap gap-2">
                        ${item.foods.map(f => `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">${f}</span>`).join('')}
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

// ============================================
// NEW FEATURE 1: BMI CALCULATOR
// ============================================
async function calculateBMI() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const resultDiv = document.getElementById('bmiResult');

    if (!weight || !height) {
        alert("Kripya Weight aur Height dono bharein!");
        return;
    }

    try {
        const res = await fetch('/api/bmi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: parseFloat(weight), height: parseFloat(height) })
        });
        const data = await res.json();
        
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <p>Your BMI: <span class="text-2xl">${data.bmi}</span></p>
            <p class="text-sm font-normal mt-1">${data.status}</p>
        `;
    } catch (err) {
        alert("Error calculating BMI");
    }
}

// ============================================
// NEW FEATURE 2: WATER TRACKER
// ============================================
let currentWater = 0;
const targetWater = 8;

async function loadWater() {
    try {
        const res = await fetch('/api/water');
        const data = await res.json();
        currentWater = data.glasses;
        updateWaterUI();
    } catch (err) { console.error(err); }
}

function updateWaterUI() {
    const display = document.getElementById('waterCount');
    if (display) {
        display.textContent = `${currentWater} / ${targetWater}`;
        // Agar target pura ho gaya toh green color
        if (currentWater >= targetWater) {
            display.classList.replace('text-cyan-600', 'text-green-600');
        } else {
            display.classList.replace('text-green-600', 'text-cyan-600');
        }
    }
}

async function updateWater(change) {
    let newCount = currentWater + change;
    if (newCount < 0) newCount = 0;
    
    try {
        const res = await fetch('/api/water', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ glasses: newCount })
        });
        const data = await res.json();
        currentWater = data.glasses;
        updateWaterUI();
    } catch (err) { console.error(err); }
}

// ============================================
// NEW FEATURE 3: WORKOUT TIMER
// ============================================
let timerInterval = null;
let seconds = 0;
let isRunning = false;

function startTimer() {
    const btn = document.getElementById('startBtn');
    if (isRunning) {
        // Pause timer
        clearInterval(timerInterval);
        isRunning = false;
        btn.textContent = 'Resume';
        btn.classList.replace('bg-red-500', 'bg-purple-500');
    } else {
        // Start timer
        isRunning = true;
        btn.textContent = 'Pause';
        btn.classList.replace('bg-purple-500', 'bg-red-500');
        
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    isRunning = false;
    document.getElementById('timerDisplay').textContent = '00:00';
    const btn = document.getElementById('startBtn');
    btn.textContent = 'Start';
    btn.classList.replace('bg-red-500', 'bg-purple-500');
}

// ============================================
// INITIALIZE (Sab kuch start karo)
// ============================================
loadExercises();
loadDiet();
loadWater();