"""
HealthSaathi AI Health Analysis Module
Uses RandomForest, BioBERT, and SentenceTransformers for health insights
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer, util
import torch
import pickle
import os

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
        """Initialize BioBERT and SentenceTransformer models"""
        try:
            # Use lighter model for faster inference
            model_name = "emilyalsentzer/Bio_ClinicalBERT"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.bert_model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            # Semantic search model
            self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
            
            # Health knowledge base
            self.contexts = [
                "Drink 8-10 glasses of water daily for optimal hydration",
                "Maintain 7-8 hours of quality sleep for better immunity",
                "Regular exercise 30 minutes daily helps prevent diabetes and hypertension",
                "Monitor your blood pressure weekly if you have hypertension",
                "Reduce salt intake to below 2300mg per day for heart health",
                "Eat fiber-rich foods to manage cholesterol levels",
                "Check blood glucose levels regularly if diabetic",
                "Maintain BMI between 18.5-24.9 for optimal health",
                "Stress management through meditation reduces blood pressure",
                "Avoid smoking and limit alcohol consumption",
                "Take prescribed medications regularly",
                "Get annual health checkups for early disease detection",
                "Balanced diet with fruits and vegetables prevents chronic diseases",
                "Walking 10000 steps daily improves cardiovascular health",
                "Limit processed foods and added sugars"
            ]
            
            # Pre-compute embeddings for faster search
            self.context_embeddings = self.embedder.encode(self.contexts, 
                                                          convert_to_tensor=True)
        except Exception as e:
            print(f"Warning: Could not load NLP models: {e}")
            self.tokenizer = None
            self.bert_model = None
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
        """Contextual health assistant using semantic search"""
        try:
            if not self.embedder:
                return self._fallback_chat(user_input)
            
            # Encode user query
            query_embedding = self.embedder.encode(user_input, convert_to_tensor=True)
            
            # Find most similar context
            cosine_scores = util.cos_sim(query_embedding, self.context_embeddings)[0]
            best_idx = int(torch.argmax(cosine_scores))
            best_score = float(cosine_scores[best_idx])
            
            # Get best matching context
            response = self.contexts[best_idx]
            
            # Add confidence indicator
            if best_score > 0.5:
                prefix = "💬 HealthSaathi Suggests: "
            else:
                prefix = "💬 General Health Tip: "
            
            return {
                "response": prefix + response,
                "confidence": round(best_score * 100, 2),
                "source": "Semantic Search"
            }
        except Exception as e:
            return self._fallback_chat(user_input)
    
    def _fallback_chat(self, user_input):
        """Simple rule-based fallback if NLP models unavailable"""
        lower_input = user_input.lower()
        
        if "blood pressure" in lower_input or "bp" in lower_input:
            return {
                "response": "💬 To manage blood pressure: reduce salt intake, exercise regularly, maintain healthy weight, and monitor BP daily.",
                "confidence": 80,
                "source": "Rule-based"
            }
        elif "diabetes" in lower_input or "sugar" in lower_input or "glucose" in lower_input:
            return {
                "response": "💬 For diabetes management: follow low-carb diet, exercise 30 min daily, check glucose regularly, and take medications as prescribed.",
                "confidence": 80,
                "source": "Rule-based"
            }
        elif "cholesterol" in lower_input:
            return {
                "response": "💬 To lower cholesterol: eat fiber-rich foods, reduce saturated fats, exercise regularly, and consider omega-3 supplements.",
                "confidence": 80,
                "source": "Rule-based"
            }
        else:
            return {
                "response": "💬 General health tip: Maintain a balanced diet, exercise regularly, sleep 7-8 hours, and stay hydrated throughout the day.",
                "confidence": 60,
                "source": "Rule-based"
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
