from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()

# ============================================
# DATA MODELS
# ============================================
class BMIData(BaseModel):
    weight: float
    height: float

class WaterData(BaseModel):
    glasses: int

class CalorieData(BaseModel):
    weight: float
    exercise_id: int

# ============================================
# DUMMY DATA (Added MET values for Calories)
# ============================================
exercises_db = [
    {"id": 1, "name": "Push Up", "hindi": "पुश-अप", "body_part": "Chest", "sets": "3 sets × 15 reps", "animation": "/static/animations/pushup.svg", "met": 8.0},
    {"id": 2, "name": "Squat", "hindi": "स्क्वाट", "body_part": "Legs", "sets": "4 sets × 12 reps", "animation": "/static/animations/squat.svg", "met": 5.5},
    {"id": 3, "name": "Plank", "hindi": "प्लैंक", "body_part": "Core", "sets": "3 sets × 60 sec", "animation": "/static/animations/plank.svg", "met": 3.0},
    {"id": 4, "name": "Pull Up", "hindi": "पुल-अप", "body_part": "Back", "sets": "3 sets × 8 reps", "animation": "/static/animations/pullup.svg", "met": 8.0},
    {"id": 5, "name": "Burpee", "hindi": "बर्पी", "body_part": "Full Body", "sets": "3 sets × 10 reps", "animation": "/static/animations/burpee.svg", "met": 10.0},
    {"id": 6, "name": "Bicep Curl", "hindi": "बाइसेप कर्ल", "body_part": "Arms", "sets": "3 sets × 12 reps", "animation": "/static/animations/bicep.svg", "met": 3.5},
]

diet_db = [
    {"goal": "Weight Loss / वजन घटाना", "tip": "Calorie deficit maintain karein. Sugar kam karein aur protein badhayein.", "foods": ["Oats", "Eggs", "Dal", "Salad", "Green Tea"]},
    {"goal": "Muscle Gain / मसल गेन", "tip": "Protein intake badhayein aur progressive overload karein.", "foods": ["Chicken", "Paneer", "Milk", "Banana", "Peanuts"]},
    {"goal": "Weight Gain / वजन बढ़ाना", "tip": "Healthy carbs aur fats lein. Meal frequency badhayein.", "foods": ["Rice", "Ghee", "Dry Fruits", "Potato", "Butter"]},
    {"goal": "Maintenance / बनाए रखना", "tip": "Balanced diet rakhein. Regular exercise karein.", "foods": ["Fruits", "Veggies", "Whole Grains", "Curd", "Nuts"]},
]

water_tracker = {"glasses": 0, "target": 8}

# ============================================
# API ROUTES
# ============================================
@app.get("/api/exercises")
def get_exercises():
    return exercises_db

@app.get("/api/diet")
def get_diet():
    return diet_db

@app.post("/api/bmi")
def calculate_bmi(data: BMIData):
    height_m = data.height / 100
    bmi = data.weight / (height_m ** 2)
    bmi = round(bmi, 1)
    if bmi < 18.5: status = "Underweight / कम वजन"
    elif bmi < 24.9: status = "Normal / सामान्य"
    elif bmi < 29.9: status = "Overweight / अधिक वजन"
    else: status = "Obese / मोटापा"
    return {"bmi": bmi, "status": status}

@app.post("/api/calories")
def calculate_calories(data: CalorieData):
    # MET formula: Calories = MET * weight(kg) * time(hr)
    exercise = next((ex for ex in exercises_db if ex["id"] == data.exercise_id), None)
    if not exercise:
        return {"error": "Exercise not found"}
    
    # Assuming 15 mins (0.25 hrs) of workout for this estimate
    calories = exercise["met"] * data.weight * 0.25 
    return {"calories": round(calories, 1), "time": "15 mins"}

@app.get("/api/water")
def get_water():
    return water_tracker

@app.post("/api/water")
def update_water(data: WaterData):
    water_tracker["glasses"] = data.glasses
    return water_tracker

# ============================================
# PAGES SERVE
# ============================================
@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.get("/diet.html")
def diet_page():
    return FileResponse("static/diet.html")

app.mount("/static", StaticFiles(directory="static"), name="static")