import { html, render } from 'lit-html';
import { fit_backend } from 'declarations/fit_backend';

class App {
  constructor() {
    this.currentPage = 'calculator';
    this.#render();
  }

  #handleNavigation = (page) => {
    this.currentPage = page;
    this.#render();
  };

  #handleCalculate = async (e) => {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value;
    const duration = parseFloat(document.getElementById('duration').value);
    const intensity = document.getElementById('intensity').value;
    const weight = parseFloat(document.getElementById('weight').value);

    try {
      // Get calories from backend
      const calories = await fit_backend.calculateCalories(exercise, duration, intensity, weight);
      
      // Get exercise info from backend
      const exerciseInfoOpt = await fit_backend.getExerciseInfo(exercise);
      
      // Save the workout after successful calculation
      await fit_backend.saveWorkout(exercise, duration, calories);
      
      // Handle the optional value
      if (exerciseInfoOpt.length === 0) {
        throw new Error("Exercise information not found");
      }
      
      const exerciseInfo = exerciseInfoOpt[0];
      
      // Update the result
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `
        <div class="calories-result">You burned approximately ${Math.round(calories)} calories!</div>
        <div class="exercise-info">
          <h3>${exerciseInfo.name}</h3>
          <p>${exerciseInfo.description}</p>
          <h4>Benefits:</h4>
          <ul>
            ${exerciseInfo.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
      `;
      
      // After saving the workout, update the personal bests display
      await this.#updatePersonalBests(exercise);
    } catch (error) {
      document.getElementById('result').textContent = `Error: ${error.message}`;
    }
  };

  #handleMealPlan = (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weight-meal').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[activity];

    // Adjust calories based on goal
    let targetCalories;
    let proteinGrams;
    let carbGrams;
    let fatGrams;

    switch(goal) {
      case 'lose':
        targetCalories = tdee - 500; // 500 calorie deficit
        proteinGrams = weight * 2.2; // Higher protein for preservation
        fatGrams = weight * 0.8;
        break;
      case 'maintain':
        targetCalories = tdee;
        proteinGrams = weight * 1.8;
        fatGrams = weight * 1;
        break;
      case 'gain':
        targetCalories = tdee + 500; // 500 calorie surplus
        proteinGrams = weight * 2;
        fatGrams = weight * 1.2;
        break;
    }

    // Calculate remaining calories for carbs
    const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
    carbGrams = Math.round(remainingCalories / 4);

    // Update results
    document.getElementById('macro-results').innerHTML = `
      <div class="macro-card">
        <h3>Daily Targets</h3>
        <div class="macro-value">Calories: ${Math.round(targetCalories)} kcal</div>
        <div class="macro-value">Protein: ${Math.round(proteinGrams)}g</div>
        <div class="macro-value">Carbs: ${Math.round(carbGrams)}g</div>
        <div class="macro-value">Fat: ${Math.round(fatGrams)}g</div>
      </div>
    `;
  };

  async #updatePersonalBests(exercise) {
    try {
      const personalBestsOpt = await fit_backend.getPersonalBests(exercise);
      if (personalBestsOpt.length === 0) {
        document.getElementById('personal-bests').innerHTML = `
          <h3>Personal Bests for ${exercise}</h3>
          <p>No records yet. Complete a workout to set your first record!</p>
        `;
        return;
      }
      
      const personalBests = personalBestsOpt[0];
      document.getElementById('personal-bests').innerHTML = `
        <h3>Personal Bests for ${exercise}</h3>
        <div class="best-stats">
          <div class="stat">
            <div class="label">Longest Duration</div>
            <div class="value">${Math.round(personalBests.longestDuration)} minutes</div>
          </div>
          <div class="stat">
            <div class="label">Most Calories Burned</div>
            <div class="value">${Math.round(personalBests.highestCalories)} calories</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error fetching personal bests:', error);
    }
  }

  #renderCalculator() {
    return html`
      <div class="calculator-container">
        <h1>Calorie Burn Calculator</h1>
        <form action="#" class="calculator-form">
          <div class="form-group">
            <label for="exercise">Exercise Type:</label>
            <select id="exercise" required @change=${(e) => this.#updatePersonalBests(e.target.value)}>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="walking">Walking</option>
              <option value="weightlifting">Weight Lifting</option>
              <option value="yoga">Yoga</option>
              <option value="boxing">Boxing</option>
              <option value="rowing">Rowing</option>
              <option value="jumpRope">Jump Rope</option>
            </select>
          </div>

          <div class="form-group">
            <label for="duration">Duration (minutes):</label>
            <input type="number" id="duration" min="1" required>
          </div>

          <div class="form-group">
            <label for="intensity">Intensity Level:</label>
            <select id="intensity" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="form-group">
            <label for="weight">Weight (kg):</label>
            <input type="number" id="weight" min="1" required>
          </div>

          <button type="submit" class="calculate-btn">Calculate Calories</button>
        </form>
        <div id="result" class="result"></div>
        <div id="personal-bests" class="personal-bests"></div>
      </div>
    `;
  }

  #renderWorkoutSplits() {
    return html`
      <div class="splits-container">
        <h1>Training Splits</h1>
        <div class="splits-grid">
          <!-- Push Pull Legs Split -->
          <div class="split-card">
            <h2>Push Pull Legs (PPL)</h2>
            <p class="split-description">A 3-day split focusing on pushing movements, pulling movements, and leg exercises separately.</p>
            <div class="days-container">
              <div class="day-section">
                <h3>Day 1: Push</h3>
                <ul>
                  <li>Bench Press (4 sets, 8-12 reps)</li>
                  <li>Overhead Press (3 sets, 8-12 reps)</li>
                  <li>Incline Dumbbell Press (3 sets, 10-12 reps)</li>
                  <li>Lateral Raises (3 sets, 12-15 reps)</li>
                  <li>Tricep Pushdowns (3 sets, 12-15 reps)</li>
                  <li>Dips (3 sets, to failure)</li>
                </ul>
              </div>
              <div class="day-section">
                <h3>Day 2: Pull</h3>
                <ul>
                  <li>Barbell Rows (4 sets, 8-12 reps)</li>
                  <li>Pull-ups/Lat Pulldowns (3 sets, 8-12 reps)</li>
                  <li>Face Pulls (3 sets, 12-15 reps)</li>
                  <li>Bicep Curls (3 sets, 12-15 reps)</li>
                  <li>Hammer Curls (3 sets, 12-15 reps)</li>
                  <li>Deadlifts (3 sets, 8-10 reps)</li>
                </ul>
              </div>
              <div class="day-section">
                <h3>Day 3: Legs</h3>
                <ul>
                  <li>Squats (4 sets, 8-12 reps)</li>
                  <li>Romanian Deadlifts (3 sets, 8-12 reps)</li>
                  <li>Leg Press (3 sets, 10-12 reps)</li>
                  <li>Leg Extensions (3 sets, 12-15 reps)</li>
                  <li>Calf Raises (4 sets, 15-20 reps)</li>
                  <li>Leg Curls (3 sets, 12-15 reps)</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Upper Lower Split -->
          <div class="split-card">
            <h2>Upper Lower Split</h2>
            <p class="split-description">A 4-day split dividing workouts into upper and lower body sessions.</p>
            <div class="days-container">
              <div class="day-section">
                <h3>Day 1: Upper A</h3>
                <ul>
                  <li>Bench Press (4 sets, 6-8 reps)</li>
                  <li>Rows (4 sets, 8-10 reps)</li>
                  <li>Overhead Press (3 sets, 8-12 reps)</li>
                  <li>Lat Pulldowns (3 sets, 10-12 reps)</li>
                  <li>Lateral Raises (3 sets, 12-15 reps)</li>
                  <li>Tricep Extensions (3 sets, 12-15 reps)</li>
                </ul>
              </div>
              <div class="day-section">
                <h3>Day 2: Lower A</h3>
                <ul>
                  <li>Squats (4 sets, 6-8 reps)</li>
                  <li>Romanian Deadlifts (3 sets, 8-10 reps)</li>
                  <li>Leg Press (3 sets, 10-12 reps)</li>
                  <li>Leg Extensions (3 sets, 12-15 reps)</li>
                  <li>Calf Raises (4 sets, 15-20 reps)</li>
                  <li>Core Work (3 sets)</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Full Body Split -->
          <div class="split-card">
            <h2>Full Body Split</h2>
            <p class="split-description">A 3-day full body workout ideal for beginners or those with limited time.</p>
            <div class="days-container">
              <div class="day-section">
                <h3>Full Body Workout (3x per week)</h3>
                <ul>
                  <li>Squats (3 sets, 8-12 reps)</li>
                  <li>Bench Press (3 sets, 8-12 reps)</li>
                  <li>Rows (3 sets, 8-12 reps)</li>
                  <li>Overhead Press (3 sets, 8-12 reps)</li>
                  <li>Romanian Deadlifts (3 sets, 8-12 reps)</li>
                  <li>Pull-ups/Lat Pulldowns (3 sets, 8-12 reps)</li>
                  <li>Core Work (2-3 sets)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  #renderMealPlanner() {
    return html`
      <div class="meal-planner-container">
        <div class="calculator-section">
          <h1>Meal Planner</h1>
          <form class="meal-form" @submit=${this.#handleMealPlan}>
            <div class="form-row">
              <div class="form-group">
                <label for="weight-meal">Weight (kg)</label>
                <input type="number" id="weight-meal" required min="30" max="250">
              </div>
              <div class="form-group">
                <label for="height">Height (cm)</label>
                <input type="number" id="height" required min="120" max="250">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="age">Age</label>
                <input type="number" id="age" required min="15" max="100">
              </div>
              <div class="form-group">
                <label for="gender">Gender</label>
                <select id="gender" required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="activity">Activity Level</label>
                <select id="activity" required>
                  <option value="sedentary">Sedentary (office job)</option>
                  <option value="light">Light Exercise (1-2 days/week)</option>
                  <option value="moderate">Moderate Exercise (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="veryActive">Very Active (athletic/physical job)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="goal">Goal</label>
                <select id="goal" required>
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Muscle</option>
                </select>
              </div>
            </div>

            <button type="submit" class="calculate-btn">Calculate Macros</button>
          </form>
          <div id="macro-results"></div>
        </div>

        <div class="meal-plans-section">
          <h2>Sample Meal Plans</h2>
          <div class="meal-plans-grid">
            <div class="meal-plan-card">
              <h3>High Protein Plan</h3>
              <div class="meal">
                <h4>Breakfast (500 kcal)</h4>
                <ul>
                  <li>3 egg whites + 1 whole egg scrambled</li>
                  <li>Oatmeal with protein powder</li>
                  <li>1 banana</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Lunch (600 kcal)</h4>
                <ul>
                  <li>150g chicken breast</li>
                  <li>Brown rice</li>
                  <li>Mixed vegetables</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Dinner (500 kcal)</h4>
                <ul>
                  <li>200g salmon</li>
                  <li>Sweet potato</li>
                  <li>Broccoli</li>
                </ul>
              </div>
            </div>

            <div class="meal-plan-card">
              <h3>Balanced Plan</h3>
              <div class="meal">
                <h4>Breakfast (400 kcal)</h4>
                <ul>
                  <li>Greek yogurt with berries</li>
                  <li>Granola</li>
                  <li>Honey</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Lunch (550 kcal)</h4>
                <ul>
                  <li>Turkey sandwich</li>
                  <li>Apple</li>
                  <li>Mixed nuts</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Dinner (450 kcal)</h4>
                <ul>
                  <li>Lean beef stir-fry</li>
                  <li>Quinoa</li>
                  <li>Mixed vegetables</li>
                </ul>
              </div>
            </div>

            <div class="meal-plan-card">
              <h3>Plant-Based Plan</h3>
              <div class="meal">
                <h4>Breakfast (450 kcal)</h4>
                <ul>
                  <li>Smoothie bowl with plant protein</li>
                  <li>Chia seeds</li>
                  <li>Almond butter</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Lunch (500 kcal)</h4>
                <ul>
                  <li>Chickpea curry</li>
                  <li>Brown rice</li>
                  <li>Spinach</li>
                </ul>
              </div>
              <div class="meal">
                <h4>Dinner (400 kcal)</h4>
                <ul>
                  <li>Lentil pasta</li>
                  <li>Tomato sauce</li>
                  <li>Garden salad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  #renderHistory() {
    return html`
      <div class="history-section">
        <h2>Recent Workouts</h2>
        <div class="workout-history">
          ${this.workoutHistory.map(entry => html`
            <div class="history-card">
              <h3>${entry.exercise}</h3>
              <p>Duration: ${entry.duration} minutes</p>
              <p>Calories: ${Math.round(entry.calories)}</p>
              <p>Date: ${new Date(Number(entry.date)/1000000).toLocaleDateString()}</p>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  #render() {
    const body = html`
      <nav class="navbar">
        <div class="nav-brand">FitTracker</div>
        <div class="nav-links">
          <a href="#" 
            class="${this.currentPage === 'calculator' ? 'active' : ''}"
            @click=${() => this.#handleNavigation('calculator')}>
            Calorie Calculator
          </a>
          <a href="#" 
            class="${this.currentPage === 'splits' ? 'active' : ''}"
            @click=${() => this.#handleNavigation('splits')}>
            Training Splits
          </a>
          <a href="#" 
            class="${this.currentPage === 'meal-planner' ? 'active' : ''}"
            @click=${() => this.#handleNavigation('meal-planner')}>
            Meal Planner
          </a>
        </div>
      </nav>
      <main>
        ${this.currentPage === 'calculator' 
          ? this.#renderCalculator() 
          : this.currentPage === 'splits'
          ? this.#renderWorkoutSplits()
          : this.currentPage === 'history'
          ? this.#renderHistory()
          : this.#renderMealPlanner()}
      </main>
    `;
    render(body, document.getElementById('root'));
    
    if (this.currentPage === 'calculator') {
      document
        .querySelector('form')
        .addEventListener('submit', this.#handleCalculate);
    } else if (this.currentPage === 'meal-planner') {
      document
        .querySelector('.meal-form')
        .addEventListener('submit', this.#handleMealPlan);
    }
  }
}

export default App;
