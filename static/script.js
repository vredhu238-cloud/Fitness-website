// ============================================
// 1. THEME TOGGLE (Dark / Light)
// ============================================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

if (localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')) {
    html.classList.add('dark');
    if(themeToggle) themeToggle.textContent = '☀️';
} else {
    html.classList.remove('dark');
    if(themeToggle) themeToggle.textContent = '🌙';
}

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });
}

// ============================================
// 2. LANGUAGE TOGGLE
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
        
        // Agar home page par hain, toh exercises wapas load karein naye naam ke liye
        if(document.getElementById('exerciseList')) {
            loadExercises(); 
        }
    });
}

// ============================================
// 3. DAILY STREAK TRACKER
// ============================================
function updateStreak() {
    const streakEl = document.getElementById('streakCount');
    if (!streakEl) return; // Agar diet page par hain toh skip karein

    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('streak') || '0');

    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
            streak++;
        } else {
            streak = 1;
        }
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastVisit', today);
    }
    streakEl.textContent = streak;
}
updateStreak();

// ============================================
// 4. MUSIC PLAYER
// ============================================
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let isPlaying = false;

function toggleMusic() {
    if (!music) return;
    if (isPlaying) {
        music.pause();
        if(musicBtn) musicBtn.textContent = '▶️';
    } else {
        music.play();
        if(musicBtn) musicBtn.textContent = '⏸️';
    }
    isPlaying = !isPlaying;
}

// ============================================
// 5. EXERCISES LOAD & CALORIE MODAL
// ============================================
let currentExerciseId = 1;

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
                <div onclick="openModal(${ex.id}, '${ex.name}')" class="glass-card rounded-3xl p-6 group cursor-pointer bg-white dark:bg-transparent hover:-translate-y-2 transition-transform duration-300">
                    <div class="bg-gray-50 dark:bg-darker/80 rounded-2xl p-6 mb-5 flex justify-center items-center h-48 border border-gray-200 dark:border-white/5 group-hover:border-neon/50 transition duration-300">
                        <img src="${ex.animation}" alt="${ex.name}" class="w-40 h-40 object-contain filter drop-shadow-lg group-hover:scale-110 transition duration-300">
                    </div>
                    <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center tracking-wide" data-en="${ex.name}" data-hi="${ex.hindi}">${name}</h4>
                    <p class="text-center text-gray-500 dark:text-gray-400 text-sm mb-4 uppercase tracking-wider font-semibold">${ex.body_part}</p>
                    <div class="bg-orange-50 dark:bg-neon/10 text-orange-600 dark:text-neon border border-orange-200 dark:border-neon/20 text-center py-2.5 rounded-xl text-sm font-bold tracking-wide group-hover:bg-neon group-hover:text-white transition-colors">
                        ${ex.sets}
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error(err); }
}

// MODAL LOGIC
const modal = document.getElementById('calorieModal');
const modalContent = document.getElementById('modalContent');

function openModal(id, name) {
    if (!modal) return;
    currentExerciseId = id;
    document.getElementById('modalTitle').textContent = name + " Calories";
    document.getElementById('calorieResult').classList.add('hidden');
    document.getElementById('modalWeight').value = '';
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

async function calculateCalories() {
    const weight = document.getElementById('modalWeight').value;
    const resultDiv = document.getElementById('calorieResult');
    if (!weight) return alert("Kripya apna weight daalein!");
    
    try {
        const res = await fetch('/api/calories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: parseFloat(weight), exercise_id: currentExerciseId })
        });
        const data = await res.json();
        
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `🔥 Burn approx: <span class="text-3xl text-white bg-neon px-3 py-1 rounded-lg">${data.calories} kcal</span> <br><span class="text-sm font-normal text-gray-500 mt-2 block">(In ${data.time})</span>`;
    } catch (err) { console.error(err); }
}

// ============================================
// 6. BMI CALCULATOR
// ============================================
async function calculateBMI() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const resultDiv = document.getElementById('bmiResult');
    if (!weight || !height) return alert("Weight & Height required!");

    try {
        const res = await fetch('/api/bmi', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: parseFloat(weight), height: parseFloat(height) })
        });
        const data = await res.json();
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `BMI: <span class="text-3xl">${data.bmi}</span> <br><span class="text-sm font-normal mt-1 block">${data.status}</span>`;
    } catch (err) { console.error(err); }
}

// ============================================
// 7. WATER TRACKER
// ============================================
let currentWater = 0;
const targetWater = 8;

async function loadWater() {
    const display = document.getElementById('waterCount');
    if (!display) return;
    
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
        display.textContent = `${currentWater}/${targetWater}`;
        if (currentWater >= targetWater) {
            display.classList.replace('text-cyan-600', 'text-green-500');
            display.classList.replace('dark:text-cyan-400', 'dark:text-green-400');
        } else {
            display.classList.replace('text-green-500', 'text-cyan-600');
            display.classList.replace('dark:text-green-400', 'dark:text-cyan-400');
        }
    }
}

async function updateWater(change) {
    let newCount = Math.max(0, currentWater + change);
    try {
        const res = await fetch('/api/water', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ glasses: newCount })
        });
        const data = await res.json();
        currentWater = data.glasses;
        updateWaterUI();
    } catch (err) { console.error(err); }
}

// ============================================
// 8. WORKOUT TIMER
// ============================================
let timerInterval = null, seconds = 0, isRunning = false;

function startTimer() {
    const btn = document.getElementById('startBtn');
    if (!btn) return;
    
    if (isRunning) {
        clearInterval(timerInterval); isRunning = false; btn.textContent = 'Resume';
        btn.classList.replace('bg-red-600', 'bg-purple-600');
    } else {
        isRunning = true; btn.textContent = 'Pause';
        btn.classList.replace('bg-purple-600', 'bg-red-600');
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval); seconds = 0; isRunning = false;
    const display = document.getElementById('timerDisplay');
    const btn = document.getElementById('startBtn');
    if(display) display.textContent = '00:00';
    if(btn) {
        btn.textContent = 'Start'; 
        btn.classList.replace('bg-red-600', 'bg-purple-600');
    }
}

// ============================================
// 9. DIET LOAD (Yeh function miss ho gaya tha)
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
                <div class="glass-card rounded-3xl p-8 border-l-4 border-green-500 bg-white dark:bg-transparent hover:-translate-y-1 transition duration-300">
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">${item.goal}</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">${item.tip}</p>
                    <div class="flex flex-wrap gap-2">
                        ${item.foods.map(f => `<span class="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30 px-4 py-1.5 rounded-full text-sm font-semibold">${f}</span>`).join('')}
                    </div>
                </div>`;
        });
    } catch (err) { console.error("Diet error:", err); }
}

// ============================================
// INITIALIZE (Sab kuch start karo)
// ============================================
loadExercises();
loadWater();
loadDiet(); // <--- Yeh line sabse zaroori hai Diet page ke liye