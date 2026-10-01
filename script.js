const addHabitBtn = document.getElementById("addHabitBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const saveHabit = document.getElementById("saveHabit");

const habitName = document.getElementById("habitName");
const frequency = document.getElementById("frequency");
const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");

const streakElement = document.getElementById("streak");
const xpElement = document.getElementById("xp");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

const todayDate = document.getElementById("todayDate");

let habits = JSON.parse(localStorage.getItem("habitQuestHabits")) || [];

let selectedEmoji = "🍬";

const today = new Date().toISOString().split("T")[0];

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

/* MODAL */

function openModal() {
    modal.classList.remove("hidden");
    habitName.focus();
}

function closeModalWindow() {
    modal.classList.add("hidden");
    habitName.value = "";
}

addHabitBtn.addEventListener("click", openModal);
emptyAddBtn.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalWindow);

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModalWindow();
    }
});

/* EMOJI */

document.querySelectorAll(".emoji").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".emoji")
            .forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        selectedEmoji = this.textContent;
    });

});

/* CREATE HABIT */

saveHabit.addEventListener("click", function () {

    const name = habitName.value.trim();

    if (name === "") {
        alert("Please enter a habit name.");
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        emoji: selectedEmoji,
        frequency: frequency.value,
        completedDates: []
    };

    habits.push(newHabit);

    saveData();
    renderHabits();
    closeModalWindow();

});

/* RENDER */

function renderHabits() {

    habitList.innerHTML = "";

    if (habits.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    habits.forEach(habit => {

        const completed = habit.completedDates.includes(today);

        const card = document.createElement("div");

        card.className = "habit-card";

        card.innerHTML = `
            <div class="habit-left">

                <div class="habit-icon">
                    ${habit.emoji}
                </div>

                <div>
                    <div class="habit-name">
                        ${escapeHTML(habit.name)}
                    </div>

                    <div class="habit-frequency">
                        ${habit.frequency === "daily"
                            ? "Every day"
                            : "Weekly"}
                    </div>
                </div>

            </div>

            <button class="check-btn ${completed ? "completed" : ""}"
                    data-id="${habit.id}">
                ${completed ? "✓" : ""}
            </button>
        `;

        habitList.appendChild(card);

    });

    document.querySelectorAll(".check-btn").forEach(button => {

        button.addEventListener("click", function () {

            const id = Number(this.dataset.id);

            toggleHabit(id);

        });

    });

    updateStats();
}

/* COMPLETE / UNCOMPLETE */

function toggleHabit(id) {

    const habit = habits.find(h => h.id === id);

    if (!habit) return;

    const index = habit.completedDates.indexOf(today);

    if (index === -1) {
        habit.completedDates.push(today);
    } else {
        habit.completedDates.splice(index, 1);
    }

    saveData();
    renderHabits();
}

/* STATS */

function updateStats() {

    if (habits.length === 0) {

        streakElement.textContent = "0 days";
        xpElement.textContent = "0";
        progressText.textContent = "0%";
        progressPercent.textContent = "0%";
        progressFill.style.width = "0%";

        return;
    }

    const completedToday = habits.filter(h =>
        h.completedDates.includes(today)
    ).length;

    const percentage = Math.round(
        (completedToday / habits.length) * 100
    );

    progressText.textContent = percentage + "%";
    progressPercent.textContent = percentage + "%";
    progressFill.style.width = percentage + "%";

    let totalXP = 0;

    habits.forEach(habit => {
        totalXP += habit.completedDates.length * 10;
    });

    xpElement.textContent = totalXP;

    const streak = calculateStreak();

    streakElement.textContent =
        streak + (streak === 1 ? " day" : " days");
}

/* STREAK */

function calculateStreak() {

    let streak = 0;

    const dates = new Set();

    habits.forEach(habit => {
        habit.completedDates.forEach(date => {
            dates.add(date);
        });
    });

    let date = new Date();

    while (true) {

        const dateString = date.toISOString().split("T")[0];

        if (dates.has(dateString)) {
            streak++;

            date.setDate(date.getDate() - 1);

        } else {
            break;
        }
    }

    return streak;
}

/* STORAGE */

function saveData() {
    localStorage.setItem(
        "habitQuestHabits",
        JSON.stringify(habits)
    );
}

/* SECURITY */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

/* START */

renderHabits();
