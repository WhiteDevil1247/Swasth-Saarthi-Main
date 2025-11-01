"""
Flask microservice for AI Health Analysis
Exposes REST endpoints for health report analysis and chat
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import health_analysis
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AI analyzer on startup
try:
    analyzer = health_analysis.get_analyzer()
    logger.info("✅ AI Health Analyzer initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize AI analyzer: {e}")
    analyzer = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "swasth-saathi-ai",
        "models_loaded": analyzer is not None
    })

@app.route('/api/ai/analyze-report', methods=['POST'])
def analyze_report():
    """
    Analyze health report
    Expected JSON: { "bp": float, "cholesterol": float, "glucose": float }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        bp = float(data.get('bp', 0))
        cholesterol = float(data.get('cholesterol', 0))
        glucose = float(data.get('glucose', 0))
        
        if bp <= 0 or cholesterol <= 0 or glucose <= 0:
            return jsonify({"error": "Invalid metric values"}), 400
        
        # Analyze
        result = health_analysis.analyze_health_report(bp, cholesterol, glucose)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid number format: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Error in analyze_report: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def health_chat():
    """
    Health assistant chat
    Expected JSON: { "message": string }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'message' not in data:
            return jsonify({"error": "No message provided"}), 400
        
        user_input = str(data['message']).strip()
        
        if not user_input:
            return jsonify({"error": "Empty message"}), 400
        
        # Get response
        result = health_analysis.health_assistant_chat(user_input)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in health_chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/trend', methods=['POST'])
def analyze_trend():
    """
    Analyze health metric trends over time
    Expected JSON: { "metric": string, "values": [numbers], "timestamps": [dates] }
    """
    try:
        data = request.get_json()
        
        metric = data.get('metric', 'blood_pressure')
        values = data.get('values', [])
        timestamps = data.get('timestamps', [])
        
        if not values:
            return jsonify({"error": "No values provided"}), 400
        
        # Simple trend analysis
        avg = sum(values) / len(values)
        trend = "stable"
        
        if len(values) >= 2:
            recent_avg = sum(values[-3:]) / min(3, len(values))
            older_avg = sum(values[:3]) / min(3, len(values))
            
            if recent_avg > older_avg * 1.1:
                trend = "increasing"
            elif recent_avg < older_avg * 0.9:
                trend = "decreasing"
        
        return jsonify({
            "metric": metric,
            "average": round(avg, 2),
            "trend": trend,
            "min": min(values),
            "max": max(values),
            "latest": values[-1] if values else None,
            "data_points": len(values)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in analyze_trend: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting AI Health Analysis Service on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
