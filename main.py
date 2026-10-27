from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()

# ============================================
# DATA MODELS (Frontend se data lene ke liye)
# ============================================
class BMIData(BaseModel):
    weight: float
    height: float

class WaterData(BaseModel):
    glasses: int

# ============================================
# DUMMY DATA
# ============================================
exercises_db = [
    {"id": 1, "name": "Push Up", "hindi": "पुश-अप", "body_part": "Chest", "sets": "3 sets × 15 reps", "animation": "/static/animations/pushup.svg"},
    {"id": 2, "name": "Squat", "hindi": "स्क्वाट", "body_part": "Legs", "sets": "4 sets × 12 reps", "animation": "/static/animations/squat.svg"},
    {"id": 3, "name": "Plank", "hindi": "प्लैंक", "body_part": "Core", "sets": "3 sets × 60 sec", "animation": "/static/animations/plank.svg"},
    {"id": 4, "name": "Pull Up", "hindi": "पुल-अप", "body_part": "Back", "sets": "3 sets × 8 reps", "animation": "/static/animations/pullup.svg"},
    {"id": 5, "name": "Burpee", "hindi": "बर्पी", "body_part": "Full Body", "sets": "3 sets × 10 reps", "animation": "/static/animations/burpee.svg"},
    {"id": 6, "name": "Bicep Curl", "hindi": "बाइसेप कर्ल", "body_part": "Arms", "sets": "3 sets × 12 reps", "animation": "/static/animations/bicep.svg"},
]

diet_db = [
    {"goal": "Weight Loss / वजन घटाना", "tip": "Calorie deficit maintain karein. Sugar kam karein aur protein badhayein.", "foods": ["Oats", "Eggs", "Dal", "Salad", "Green Tea"]},
    {"goal": "Muscle Gain / मसल गेन", "tip": "Protein intake badhayein aur progressive overload karein.", "foods": ["Chicken", "Paneer", "Milk", "Banana", "Peanuts"]},
    {"goal": "Weight Gain / वजन बढ़ाना", "tip": "Healthy carbs aur fats lein. Meal frequency badhayein.", "foods": ["Rice", "Ghee", "Dry Fruits", "Potato", "Butter"]},
    {"goal": "Maintenance / बनाए रखना", "tip": "Balanced diet rakhein. Regular exercise karein.", "foods": ["Fruits", "Veggies", "Whole Grains", "Curd", "Nuts"]},
]

# State variable for water tracker (Memory me save rahega)
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

# NAYA: BMI Calculate karne ka route
@app.post("/api/bmi")
def calculate_bmi(data: BMIData):
    height_m = data.height / 100 # cm to meter
    bmi = data.weight / (height_m ** 2)
    bmi = round(bmi, 1)
    
    if bmi < 18.5:
        status = "Underweight / कम वजन"
    elif bmi < 24.9:
        status = "Normal / सामान्य"
    elif bmi < 29.9:
        status = "Overweight / अधिक वजन"
    else:
        status = "Obese / मोटापा"
        
    return {"bmi": bmi, "status": status}

# NAYA: Water Tracker ke routes
@app.get("/api/water")
def get_water():
    return water_tracker

@app.post("/api/water")
def update_water(data: WaterData):
    water_tracker["glasses"] = data.glasses
    return water_tracker

# ============================================
# FRONTEND SERVE
# ============================================
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home():
    return FileResponse("static/index.html")