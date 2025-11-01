import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, TrendingUp, Send, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisResult {
  status: string;
  confidence: number;
  recommendation: string;
  risk_level: string;
  metrics: {
    blood_pressure: number;
    cholesterol: number;
    glucose: number;
  };
}

interface ChatResponse {
  response: string;
  confidence: number;
  source: string;
}

export const AIHealthAssistant = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'chat' | 'trends'>('report');
  
  // Report Analysis State
  const [bp, setBp] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [glucose, setGlucose] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, message: string}>>([]);
  const [chatting, setChatting] = useState(false);
  
  // Trends State
  const [bpHistory, setBpHistory] = useState<Array<{time: string, value: number}>>([]);

  const analyzeReport = async () => {
    if (!bp || !cholesterol || !glucose) {
      alert('Please fill in all fields');
      return;
    }

    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/ai/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bp: parseFloat(bp),
          cholesterol: parseFloat(cholesterol),
          glucose: parseFloat(glucose)
        })
      });

      const data = await response.json();
      setAnalysisResult(data);
      
      // Add to BP history
      const newEntry = {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(bp)
      };
      setBpHistory(prev => [...prev, newEntry].slice(-10));
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze report. Make sure AI service is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data: ChatResponse = await response.json();
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        message: data.response || 'No response received' 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        message: '❌ Failed to get response. Make sure AI service is running.' 
      }]);
    } finally {
      setChatting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Risk': return 'text-red-600 bg-red-50';
      case 'Moderate Risk': return 'text-orange-600 bg-orange-50';
      case 'Low Risk': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            🩺 AI Health Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Powered by RandomForest ML + BioBERT NLP
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Health Report Analysis</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>AI Health Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'trends'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Blood Pressure Trends</span>
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Report Analysis Tab */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Enter Your Health Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="e.g., 120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    placeholder="e.g., 200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <motion.button
                onClick={analyzeReport}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {analyzing ? 'Analyzing...' : '🔬 Analyze Health Report'}
              </motion.button>

              {/* Results */}
              {analysisResult && (
                <motion.div
                  className="mt-8 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Health Status</h3>
                      <p className="text-3xl font-bold text-indigo-600 mt-2">{analysisResult.status}</p>
                    </div>
                    <div className={`px-6 py-3 rounded-xl font-bold ${getRiskColor(analysisResult.risk_level)}`}>
                      {analysisResult.risk_level}
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">Recommendation</h4>
                        <p className="text-gray-700 whitespace-pre-line">{analysisResult.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-3">Model Confidence</h4>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
                        style={{ width: `${analysisResult.confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{analysisResult.confidence}% confidence</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* AI Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Ask HealthSaathi AI</h2>
              
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Ask me anything about health!</p>
                    <p className="text-sm mt-2">e.g., "How to manage high blood pressure?"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                {chatting && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about health, symptoms, or wellness tips..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={chatting || !chatInput.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}

          {/* BP Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Blood Pressure Over Time</h2>
              
              {bpHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No BP data yet. Analyze a report to start tracking!</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bpHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: 'BP (mmHg)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {bpHistory.length > 0 
                      ? (bpHistory.reduce((sum, item) => sum + item.value, 0) / bpHistory.length).toFixed(0)
                      : '-'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600">Latest</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {bpHistory.length > 0 ? bpHistory[bpHistory.length - 1].value : '-'}
                  </p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-xl">
                  <p className="text-sm text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-cyan-600">{bpHistory.length}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ This AI assistant provides general health insights. Always consult healthcare professionals for medical advice.</p>
        </div>
      </div>
    </motion.div>
  );
};
