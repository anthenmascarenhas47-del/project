import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def ask_local_ai(prompt: str):
    res = requests.post(OLLAMA_URL, json={
        "model": "phi3",   # or mistral / phi3
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 200}
    })

    return res.json()["response"]

def get_buy_sell_recommendation(analysis: dict) -> str:
    """
    Generate buy/sell recommendation based on model prediction probability.
    Returns empty string if probability is not extreme enough.
    """
    if not analysis or "prob_bull" not in analysis:
        return ""
    
    prob_bull = float(analysis.get("prob_bull", 0.5))
    prob_bear = 1.0 - prob_bull
    symbol = analysis.get('symbol', 'this stock')
    
    disclaimer = "\n⚠️ Disclaimer: I don't recommend you to buy or sell without proper research. The market never guarantees outcomes, and this is based on AI predictions only."
    
    # Very high buy signal (>80% bullish probability)
    if prob_bull >= 0.80:
        return f"🟢 Based on the AI predictions showing {prob_bull:.1%} bullish probability, I feel it's better to BUY {symbol}. However, please do your own research before making any investment decision.{disclaimer}"
    
    # Very high sell signal (<20% bullish probability / >80% bearish probability)
    elif prob_bear >= 0.80:
        return f"🔴 Based on the AI predictions showing {prob_bear:.1%} bearish probability, I feel it's better to SELL {symbol}. However, please do your own research before making any investment decision.{disclaimer}"
    
    # Moderate hold signal (between 40-60%)
    elif 0.40 <= prob_bull <= 0.60:
        return f"⏸️ Based on the AI predictions showing {prob_bull:.1%} bullish probability, I feel it's better to HOLD {symbol} and wait for a clearer signal. Please monitor the market closely and do your own research.{disclaimer}"
    
    return ""
