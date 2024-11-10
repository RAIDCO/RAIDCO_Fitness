import Time "mo:base/Time";
import Array "mo:base/Array";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Float "mo:base/Float";

actor {
  // Type to store exercise information
  type ExerciseInfo = {
    name: Text;
    description: Text;
    benefits: [Text];
    caloriesPerHour: Float;
  };

  // Database of exercise information
  let exerciseDB = {
    running = {
      name = "Running";
      description = "A high-impact cardio exercise that involves moving at a fast pace";
      benefits = ["Improves cardiovascular health", "Builds strong bones", "Strengthens muscles", "Helps maintain healthy weight"];
      caloriesPerHour = 800.0;
    };
    cycling = {
      name = "Cycling";
      description = "A low-impact cardio exercise that can be done indoors or outdoors";
      benefits = ["Low impact on joints", "Improves leg strength", "Increases stamina", "Environmentally friendly transport"];
      caloriesPerHour = 600.0;
    };
    swimming = {
      name = "Swimming";
      description = "A full-body workout that takes place in water";
      benefits = ["Works entire body", "Zero impact on joints", "Improves flexibility", "Builds endurance"];
      caloriesPerHour = 700.0;
    };
    walking = {
      name = "Walking";
      description = "A low-intensity exercise suitable for all fitness levels";
      benefits = ["Improves cardiovascular health", "Low impact on joints", "Can be done anywhere", "Great for mental health"];
      caloriesPerHour = 300.0;
    };
    weightlifting = {
      name = "Weight Lifting";
      description = "Resistance training using weights to build strength";
      benefits = ["Builds muscle mass", "Increases bone density", "Improves metabolism", "Enhances functional strength"];
      caloriesPerHour = 400.0;
    };
    yoga = {
      name = "Yoga";
      description = "A mind-body practice combining physical postures, breathing techniques, and meditation";
      benefits = ["Improves flexibility", "Reduces stress", "Enhances balance", "Strengthens core muscles", "Promotes mental clarity"];
      caloriesPerHour = 250.0;
    };
    boxing = {
      name = "Boxing";
      description = "A high-intensity combat sport that combines cardio and strength training";
      benefits = ["Improves cardiovascular fitness", "Builds upper body strength", "Enhances hand-eye coordination", "Reduces stress", "Boosts confidence"];
      caloriesPerHour = 700.0;
    };
    rowing = {
      name = "Rowing";
      description = "A full-body workout that simulates the action of watercraft rowing";
      benefits = ["Works 86% of muscles", "Low impact on joints", "Improves posture", "Builds endurance", "Increases power"];
      caloriesPerHour = 600.0;
    };
    jumpRope = {
      name = "Jump Rope";
      description = "A high-impact cardio exercise using a rope, great for coordination";
      benefits = ["Improves coordination", "Burns calories efficiently", "Strengthens leg muscles", "Portable workout", "Enhances agility"];
      caloriesPerHour = 750.0;
    };
  };

  // Calculate calories burned
  public query func calculateCalories(exercise: Text, duration: Float, intensity: Text, weight: Float) : async Float {
    let baseCalories = switch(exercise) {
      case "running" { 800.0 };
      case "cycling" { 600.0 };
      case "swimming" { 700.0 };
      case "walking" { 300.0 };
      case "weightlifting" { 400.0 };
      case "yoga" { 250.0 };
      case "boxing" { 700.0 };
      case "rowing" { 600.0 };
      case "jumpRope" { 750.0 };
      case _ { 0.0 };
    };

    let intensityMultiplier = switch(intensity) {
      case "low" { 0.8 };
      case "medium" { 1.0 };
      case "high" { 1.2 };
      case _ { 1.0 };
    };

    // Calculate calories: (base calories per hour * weight factor * intensity * duration in hours)
    let weightFactor = weight / 70.0; // Normalized to a 70kg person
    let durationHours = duration / 60.0;
    
    return baseCalories * weightFactor * intensityMultiplier * durationHours;
  };

  // Get exercise information
  public query func getExerciseInfo(exercise: Text) : async ?ExerciseInfo {
    switch(exercise) {
      case "running" { ?exerciseDB.running };
      case "cycling" { ?exerciseDB.cycling };
      case "swimming" { ?exerciseDB.swimming };
      case "walking" { ?exerciseDB.walking };
      case "weightlifting" { ?exerciseDB.weightlifting };
      case "yoga" { ?exerciseDB.yoga };
      case "boxing" { ?exerciseDB.boxing };
      case "rowing" { ?exerciseDB.rowing };
      case "jumpRope" { ?exerciseDB.jumpRope };
      case _ { null };
    };
  };

  // Simple type for workout history
  type WorkoutEntry = {
    exercise: Text;
    duration: Float;
    calories: Float;
    date: Int;  // Timestamp
  };

  // Store workouts in a simple array
  private var workoutHistory : [WorkoutEntry] = [];

  // Add a workout to history
  public func saveWorkout(exercise: Text, duration: Float, calories: Float) : async Bool {
    let entry = {
      exercise = exercise;
      duration = duration;
      calories = calories;
      date = Time.now();
    };
    workoutHistory := Array.append(workoutHistory, [entry]);

    // Update personal bests
    switch (personalBests.get(exercise)) {
        case (null) {
            // First time doing this exercise
            personalBests.put(exercise, {
                longestDuration = duration;
                highestCalories = calories;
                lastUpdated = Time.now();
            });
        };
        case (?existing) {
            // Update if new personal best
            personalBests.put(exercise, {
                longestDuration = Float.max(duration, existing.longestDuration);
                highestCalories = Float.max(calories, existing.highestCalories);
                lastUpdated = Time.now();
            });
        };
    };

    return true;
  };

  // Get workout history
  public query func getWorkoutHistory() : async [WorkoutEntry] {
    workoutHistory
  };

  // Type for personal bests
  type PersonalBest = {
    longestDuration: Float;
    highestCalories: Float;
    lastUpdated: Int;
  };

  // Store personal bests for each exercise
  private var personalBests = Map.HashMap<Text, PersonalBest>(0, Text.equal, Text.hash);

  // Get personal bests for an exercise
  public query func getPersonalBests(exercise: Text) : async ?PersonalBest {
    personalBests.get(exercise)
  };
};
