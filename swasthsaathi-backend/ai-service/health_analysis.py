"""
HealthSaathi AI Health Analysis Module
Provides ML-based health predictions and rule-based health chat
Models: RandomForest for classification, Rule-based NLP
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import warnings
warnings.filterwarnings('ignore')

class HealthAnalyzer:
    def __init__(self):
        # Initialize models
        self.setup_ml_model()
        self.setup_nlp_models()
        
    def setup_ml_model(self):
        """Train RandomForest model on sample health data"""
        # Sample training data (in production, load from database)
        data = pd.DataFrame({
            'BP': [120, 150, 130, 170, 140, 110, 160, 125, 145, 155],
            'Cholesterol': [180, 250, 200, 300, 220, 170, 280, 190, 240, 260],
            'Glucose': [90, 140, 110, 200, 130, 85, 180, 95, 150, 170],
            'Label': ['Normal', 'Hypertension', 'Borderline', 'Diabetic', 
                     'Borderline', 'Normal', 'Hypertension', 'Normal', 
                     'Hypertension', 'Diabetic']
        })
        
        X = data[['BP', 'Cholesterol', 'Glucose']]
        y = data['Label']
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Calculate feature importances
        self.feature_names = ['BP', 'Cholesterol', 'Glucose']
        self.feature_importance = dict(zip(self.feature_names, 
                                           self.model.feature_importances_))
    
    def setup_nlp_models(self):
        """Initialize rule-based NLP (no heavy models needed)"""
        try:
            print("Setting up health knowledge base...")
            
            # Health knowledge base for contextual answers
            self.health_knowledge = {
                'blood pressure': "High blood pressure can be managed through diet, exercise, and medication. Reduce sodium intake, maintain healthy weight, and take prescribed medications regularly.",
                'hypertension': "Hypertension requires lifestyle changes: reduce salt, exercise 30 minutes daily, maintain healthy weight, limit alcohol, and take medications as prescribed.",
                'diabetes': "Diabetes management requires monitoring blood sugar, taking medications as prescribed, eating balanced meals with low glycemic index, and regular exercise.",
                'cholesterol': "High cholesterol can be lowered by eating healthy fats (omega-3), avoiding trans fats, exercising regularly, and taking statins if prescribed by your doctor.",
                'heart': "Cardiovascular health is maintained through regular exercise, balanced diet, stress management, adequate sleep, and avoiding smoking.",
                'exercise': "Regular exercise helps maintain cardiovascular health. Aim for 150 minutes of moderate activity per week, including cardio and strength training.",
                'diet': "A balanced diet with fruits, vegetables, whole grains, lean proteins, and healthy fats supports overall health and prevents chronic diseases.",
                'stress': "Stress management through meditation, yoga, deep breathing, counseling, or hobbies can improve both mental and physical health.",
                'sleep': "Getting 7-9 hours of quality sleep is essential for health, recovery, immune function, and mental wellbeing.",
                'weight': "Weight management through portion control, balanced nutrition, regular activity, and lifestyle changes prevents many chronic diseases.",
                'sugar': "Blood sugar management involves eating complex carbs, monitoring glucose levels, taking medications, and maintaining regular meal times.",
                'mental health': "Mental health is as important as physical health. Seek professional help when needed, practice self-care, and maintain social connections.",
                'pain': "Chronic pain management may require medication, physical therapy, lifestyle changes, stress reduction, and sometimes alternative therapies.",
                'water': "Staying hydrated by drinking 8-10 glasses of water daily is important for all body functions, digestion, and temperature regulation.",
                'smoking': "Avoiding tobacco and limiting alcohol consumption significantly reduces risks of cancer, heart disease, and respiratory problems."
            }
            
            print("✅ Health knowledge base loaded successfully")
        except Exception as e:
            print(f"⚠️ Error setting up knowledge base: {e}")
            self.health_knowledge = {}
            self.embedder = None
    
    def analyze_report(self, bp, cholesterol, glucose):
        """Analyze health metrics and return prediction"""
        try:
            # Make prediction
            pred = self.model.predict([[bp, cholesterol, glucose]])[0]
            proba = self.model.predict_proba([[bp, cholesterol, glucose]])[0]
            confidence = float(max(proba))
            
            # Generate recommendation
            recommendation = self.generate_recommendation(pred, bp, cholesterol, glucose)
            
            # Risk assessment
            risk_level = self.assess_risk(bp, cholesterol, glucose)
            
            return {
                "status": pred,
                "confidence": round(confidence * 100, 2),
                "recommendation": recommendation,
                "risk_level": risk_level,
                "metrics": {
                    "blood_pressure": bp,
                    "cholesterol": cholesterol,
                    "glucose": glucose
                },
                "feature_importance": self.feature_importance
            }
        except Exception as e:
            return {"error": str(e)}
    
    def generate_recommendation(self, label, bp, cholesterol, glucose):
        """Generate detailed health recommendations"""
        base_recs = {
            "Normal": "Your health metrics are within normal range. Maintain regular exercise and balanced diet.",
            "Hypertension": "Your blood pressure is elevated. Reduce salt intake, monitor BP daily, and consult a cardiologist.",
            "Borderline": "Your metrics show warning signs. Increase fiber intake, exercise regularly, and check levels monthly.",
            "Diabetic": "Your glucose levels indicate diabetes. Follow a low-sugar diet, increase physical activity, and track glucose regularly."
        }
        
        # Add specific warnings
        warnings = []
        if bp > 140:
            warnings.append("⚠️ High blood pressure detected - immediate medical attention recommended")
        if cholesterol > 240:
            warnings.append("⚠️ High cholesterol - consider statin therapy and dietary changes")
        if glucose > 126:
            warnings.append("⚠️ High blood sugar - consult endocrinologist for diabetes management")
        
        rec = base_recs.get(label, "Consult a healthcare professional for detailed assessment.")
        if warnings:
            rec += "\n\n" + "\n".join(warnings)
        
        return rec
    
    def assess_risk(self, bp, cholesterol, glucose):
        """Assess overall cardiovascular and metabolic risk"""
        risk_score = 0
        
        # BP risk
        if bp > 180:
            risk_score += 3
        elif bp > 140:
            risk_score += 2
        elif bp > 130:
            risk_score += 1
        
        # Cholesterol risk
        if cholesterol > 300:
            risk_score += 3
        elif cholesterol > 240:
            risk_score += 2
        elif cholesterol > 200:
            risk_score += 1
        
        # Glucose risk
        if glucose > 200:
            risk_score += 3
        elif glucose > 126:
            risk_score += 2
        elif glucose > 100:
            risk_score += 1
        
        if risk_score >= 7:
            return "High Risk"
        elif risk_score >= 4:
            return "Moderate Risk"
        elif risk_score >= 1:
            return "Low Risk"
        else:
            return "Minimal Risk"
    
    def health_chat(self, user_input):
        """Health assistant chat using keyword matching"""
        try:
            return self._simple_chat(user_input)
        except Exception as e:
            return {
                'response': f"I'm here to help with health questions. Could you rephrase that?",
                'confidence': 0.5,
                'source': 'error_fallback'
            }
    
    def _simple_chat(self, user_input):
        """Keyword-based chat with health knowledge"""
        user_lower = user_input.lower()
        
        # Find matching keywords
        best_match = None
        best_confidence = 0.0
        
        for keyword, response in self.health_knowledge.items():
            if keyword in user_lower:
                # Calculate simple confidence based on keyword match
                confidence = 0.85 if len(keyword.split()) > 1 else 0.75
                if confidence > best_confidence:
                    best_match = response
                    best_confidence = confidence
        
        if best_match:
            return {
                'response': best_match,
                'confidence': best_confidence,
                'source': 'keyword_match'
            }
        
        # Default response with available topics
        topics = ', '.join(list(self.health_knowledge.keys())[:10])
        return {
            'response': f"I can help with questions about: {topics}. What would you like to know?",
            'confidence': 0.6,
            'source': 'default'
        }

# Global analyzer instance
analyzer = None

def get_analyzer():
    """Get or create singleton analyzer instance"""
    global analyzer
    if analyzer is None:
        analyzer = HealthAnalyzer()
    return analyzer

# API-compatible functions
def analyze_health_report(bp: float, cholesterol: float, glucose: float):
    """Analyze health report - API endpoint function"""
    analyzer = get_analyzer()
    return analyzer.analyze_report(bp, cholesterol, glucose)

def health_assistant_chat(user_input: str):
    """Health chat assistant - API endpoint function"""
    analyzer = get_analyzer()
    return analyzer.health_chat(user_input)

# CLI testing
if __name__ == "__main__":
    print("🩺 HealthSaathi AI Module - Testing")
    print("=" * 50)
    
    # Test report analysis
    result = analyze_health_report(150, 250, 140)
    print("\n📊 Health Report Analysis:")
    print(f"Status: {result['status']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Recommendation: {result['recommendation']}")
    
    # Test chat
    chat_result = health_assistant_chat("How to manage high blood pressure?")
    print("\n💬 Chat Assistant:")
    print(f"Response: {chat_result['response']}")
    print(f"Confidence: {chat_result['confidence']}%")
